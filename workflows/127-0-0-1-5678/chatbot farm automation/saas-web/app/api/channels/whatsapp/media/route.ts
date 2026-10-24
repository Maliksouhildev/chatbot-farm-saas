import { NextResponse } from 'next/server';
import { getCachedMedia, setCachedMedia } from '@/lib/whatsapp-media-cache';

function generateExpiredMediaSvg(title = 'Photo expirée', subtitle = 'Non disponible sur WhatsApp'): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#182229"/>
      <stop offset="100%" stop-color="#0b141a"/>
    </linearGradient>
  </defs>
  <rect width="300" height="200" rx="16" fill="url(#bg)"/>
  <rect x="1" y="1" width="298" height="198" rx="15" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1.5"/>
  <circle cx="150" cy="75" r="28" fill="#202c33" stroke="rgba(255,255,255,0.06)" stroke-width="1.5"/>
  <g transform="translate(136, 61)" stroke="#8696a0" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <rect width="28" height="22" rx="4" />
    <circle cx="8" cy="7" r="2" />
    <path d="m26 17-6-6-10 10" />
    <line x1="2" y1="2" x2="26" y2="20" stroke="#ef4444" stroke-width="2" />
  </g>
  <text x="150" y="132" text-anchor="middle" fill="#e9edef" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600">${title}</text>
  <text x="150" y="152" text-anchor="middle" fill="#8696a0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11">${subtitle}</text>
</svg>`;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const messageId = searchParams.get('messageId');
    const instance = searchParams.get('instance') || 'default_instance';
    const isDownload = searchParams.get('download') === '1';

    if (!messageId) {
      return NextResponse.json({ error: 'Missing messageId' }, { status: 400 });
    }

    const cacheKey = `${instance}:${messageId}`;
    let cached = getCachedMedia(cacheKey) || getCachedMedia(messageId);

    if (!cached) {
      const evolutionUrl = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
      const apiKey = process.env.EVOLUTION_API_KEY || 'farm_evolution_master_secret_2026';
      const headers = { apikey: apiKey, 'Content-Type': 'application/json' };

      // 1. Find message record
      let findRes = await fetch(`${evolutionUrl}/chat/findMessages/${instance}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ where: { id: messageId } })
      });
      let data = await findRes.json();
      let rec = data?.messages?.records?.[0];

      // Fallback: search by key.id if id was not the primary record id
      if (!rec) {
        findRes = await fetch(`${evolutionUrl}/chat/findMessages/${instance}`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ where: { key: { id: messageId } } })
        });
        data = await findRes.json();
        rec = data?.messages?.records?.[0];
      }

      if (!rec) {
        const svg = generateExpiredMediaSvg('Média introuvable', 'Ce message est introuvable sur le serveur');
        return new Response(svg, {
          status: 200,
          headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=3600'
          }
        });
      }

      // 2. Fetch base64 media payload
      let mediaData: any = null;
      try {
        const mediaRes = await fetch(`${evolutionUrl}/chat/getBase64FromMediaMessage/${instance}`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ message: rec })
        });
        if (mediaRes.ok) {
          mediaData = await mediaRes.json();
        }
      } catch (err) {
        console.warn('getBase64FromMediaMessage request error:', err);
      }

      if (!mediaData?.base64) {
        const thumb = rec.message?.imageMessage?.jpegThumbnail || rec.message?.videoMessage?.jpegThumbnail;
        if (thumb) {
          const thumbBuffer = typeof thumb === 'string' ? Buffer.from(thumb, 'base64') : Buffer.from(thumb);
          return new Response(new Uint8Array(thumbBuffer), {
            status: 200,
            headers: {
              'Content-Type': 'image/jpeg',
              'Content-Length': String(thumbBuffer.length),
              'Cache-Control': 'public, max-age=86400, immutable'
            }
          });
        }
        const svg = generateExpiredMediaSvg('Photo expirée', 'Non disponible sur WhatsApp');
        return new Response(svg, {
          status: 200,
          headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=86400, immutable'
          }
        });
      }

      const buffer = Buffer.from(mediaData.base64, 'base64');
      const mimetype = mediaData.mimetype || 'application/octet-stream';
      const fileName = mediaData.fileName || `whatsapp_media_${messageId}.${mimetype.split('/')[1] || 'bin'}`;

      cached = {
        buffer,
        mimetype,
        fileName,
        timestamp: Date.now()
      };
      setCachedMedia(cacheKey, cached);
      setCachedMedia(messageId, cached);
    }

    const totalSize = cached.buffer.length;
    const rangeHeader = req.headers.get('range');

    const responseHeaders: Record<string, string> = {
      'Content-Type': cached.mimetype,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=86400, immutable'
    };

    if (isDownload) {
      responseHeaders['Content-Disposition'] = `attachment; filename="${encodeURIComponent(cached.fileName)}"`;
    }

    if (rangeHeader && rangeHeader.startsWith('bytes=')) {
      const parts = rangeHeader.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10) || 0;
      let end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;
      if (end >= totalSize) end = totalSize - 1;

      if (start > end || start >= totalSize) {
        return new Response('Requested range not satisfiable', {
          status: 416,
          headers: {
            'Content-Range': `bytes */${totalSize}`
          }
        });
      }

      const chunk = cached.buffer.subarray(start, end + 1);
      responseHeaders['Content-Range'] = `bytes ${start}-${end}/${totalSize}`;
      responseHeaders['Content-Length'] = String(chunk.length);

      return new Response(new Uint8Array(chunk), {
        status: 206,
        headers: responseHeaders
      });
    }

    responseHeaders['Content-Length'] = String(totalSize);
    return new Response(new Uint8Array(cached.buffer), {
      status: 200,
      headers: responseHeaders
    });
  } catch (err: any) {
    console.error('Error in WhatsApp media GET route:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const instance = searchParams.get('instance') || 'default_instance';
    
    const body = await req.json();
    const message = body.message;

    if (!message) {
      return NextResponse.json({ error: 'Missing message object' }, { status: 400 });
    }

    const evolutionUrl = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
    const apiKey = process.env.EVOLUTION_API_KEY || 'farm_evolution_master_secret_2026';

    const res = await fetch(`${evolutionUrl}/chat/getBase64FromMediaMessage/${instance}`, {
      method: 'POST',
      headers: { apikey: apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Evolution API error fetching media:', errorText);
      return NextResponse.json({ error: 'Failed to fetch media from Evolution API' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('Error fetching whatsapp media:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
