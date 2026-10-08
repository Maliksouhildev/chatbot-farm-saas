import { NextResponse } from 'next/server';

interface CachedMedia {
  buffer: Buffer;
  mimetype: string;
  fileName: string;
  timestamp: number;
}

// In-memory cache for loaded media items (capped to avoid memory exhaustion)
const mediaCache = new Map<string, CachedMedia>();
const MAX_CACHE_SIZE = 60;

function addToCache(key: string, item: CachedMedia) {
  if (mediaCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = mediaCache.keys().next().value;
    if (oldestKey) mediaCache.delete(oldestKey);
  }
  mediaCache.set(key, item);
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
    let cached = mediaCache.get(cacheKey);

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
        return NextResponse.json({ error: 'Message not found' }, { status: 404 });
      }

      // 2. Fetch base64 media payload
      const mediaRes = await fetch(`${evolutionUrl}/chat/getBase64FromMediaMessage/${instance}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: rec })
      });

      if (!mediaRes.ok) {
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
        return NextResponse.json(
          { error: 'Media expired on WhatsApp servers' },
          { status: 404, headers: { 'Cache-Control': 'public, max-age=3600' } }
        );
      }

      const mediaData = await mediaRes.json();
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
        return NextResponse.json(
          { error: 'No media base64 found' },
          { status: 404, headers: { 'Cache-Control': 'public, max-age=3600' } }
        );
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
      addToCache(cacheKey, cached);
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
