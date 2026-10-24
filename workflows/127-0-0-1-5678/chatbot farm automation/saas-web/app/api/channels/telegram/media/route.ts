import { NextResponse } from 'next/server';
import { getClientFromSession } from '@/lib/telegram_client';

export const dynamic = 'force-dynamic';

// In-memory cache for media buffers: key -> { buffer, mime, timestamp }
const mediaCache = new Map<string, { buffer: Buffer; mime: string; timestamp: number }>();

function serveBufferWithRange(
  buffer: Buffer,
  mime: string,
  request: Request,
  downloadFilename?: string
) {
  const totalSize = buffer.length;
  const rangeHeader = request.headers.get('range');

  const headers: Record<string, string> = {
    'Content-Type': mime,
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
  };

  if (downloadFilename) {
    headers['Content-Disposition'] = `attachment; filename="${encodeURIComponent(downloadFilename)}"`;
  }

  if (rangeHeader && rangeHeader.startsWith('bytes=')) {
    const parts = rangeHeader.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10) || 0;
    let end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;
    if (end >= totalSize) end = totalSize - 1;

    if (start > end || start >= totalSize) {
      return new NextResponse('Requested range not satisfiable', {
        status: 416,
        headers: {
          'Content-Range': `bytes */${totalSize}`,
        },
      });
    }

    const chunk = buffer.subarray(start, end + 1);
    headers['Content-Range'] = `bytes ${start}-${end}/${totalSize}`;
    headers['Content-Length'] = String(chunk.length);

    return new NextResponse(new Uint8Array(chunk), {
      status: 206,
      headers,
    });
  }

  headers['Content-Length'] = String(totalSize);
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers,
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');
    const messageId = searchParams.get('messageId');
    const session = searchParams.get('session');
    const token = searchParams.get('token');
    const fileId = searchParams.get('fileId');

    const cacheKey = `${chatId || ''}_${messageId || ''}_${fileId || ''}`;
    const cached = mediaCache.get(cacheKey);
    const isDownload = searchParams.get('download') === '1';

    if (cached && Date.now() - cached.timestamp < 3600 * 1000) {
      return serveBufferWithRange(
        cached.buffer,
        cached.mime,
        request,
        isDownload ? `telegram_media_${messageId || fileId}` : undefined
      );
    }

    // 1. Personal MTProto media download
    if (session && chatId && messageId) {
      try {
        const client = await getClientFromSession(session);
        const msgs = await client.getMessages(chatId, { ids: [Number(messageId)] });
        const msg = msgs[0];
        if (msg) {
          let mediaBuf = await client.downloadMedia(msg).catch(() => null);
          if (!mediaBuf && msg.media) {
            mediaBuf = await client.downloadMedia(msg.media).catch(() => null);
          }
          if (mediaBuf) {
            const buf = Buffer.isBuffer(mediaBuf) ? mediaBuf : Buffer.from(mediaBuf as any);
            let mime = 'application/octet-stream';
            const doc = (msg.media as any)?.document || (msg as any).document;
            if (doc?.mimeType) {
              mime = doc.mimeType;
            } else if ((msg.media as any)?.className === 'MessageMediaPhoto' || (msg as any).photo) {
              mime = 'image/jpeg';
            } else if ((msg as any).voice) {
              mime = 'audio/ogg';
            } else if ((msg as any).video || (msg as any).videoNote) {
              mime = 'video/mp4';
            }

            // Normalize audio formats
            if ((msg as any).voice || mime.includes('ogg') || mime.includes('opus')) {
              mime = 'audio/ogg';
            }

            mediaCache.set(cacheKey, { buffer: buf, mime, timestamp: Date.now() });
            return serveBufferWithRange(
              buf,
              mime,
              request,
              isDownload ? `telegram_media_${messageId}` : undefined
            );
          }
        }
      } catch (err: any) {
        console.warn('[Telegram Media] MTProto download error:', err.message);
      }
    }

    // 2. Telegram Bot API fileId extraction
    const botToken = token || process.env.TELEGRAM_BOT_TOKEN;
    if (botToken && fileId) {
      try {
        const fileRes = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
        const fileData = await fileRes.json();
        const filePath = fileData?.result?.file_path;
        if (filePath) {
          const dlRes = await fetch(`https://api.telegram.org/file/bot${botToken}/${filePath}`);
          if (dlRes.ok) {
            const ab = await dlRes.arrayBuffer();
            const buf = Buffer.from(ab);
            let contentType = dlRes.headers.get('content-type') || 'application/octet-stream';
            const lowerPath = filePath.toLowerCase();
            if (lowerPath.endsWith('.oga') || lowerPath.endsWith('.ogg')) {
              contentType = 'audio/ogg';
            } else if (lowerPath.endsWith('.mp3')) {
              contentType = 'audio/mpeg';
            } else if (lowerPath.endsWith('.m4a') || lowerPath.endsWith('.mp4')) {
              contentType = lowerPath.endsWith('.m4a') ? 'audio/mp4' : 'video/mp4';
            } else if (lowerPath.endsWith('.jpg') || lowerPath.endsWith('.jpeg')) {
              contentType = 'image/jpeg';
            } else if (lowerPath.endsWith('.png')) {
              contentType = 'image/png';
            }
            mediaCache.set(cacheKey, { buffer: buf, mime: contentType, timestamp: Date.now() });
            return serveBufferWithRange(
              buf,
              contentType,
              request,
              isDownload ? `telegram_file_${fileId}` : undefined
            );
          }
        }
      } catch (err: any) {
        console.warn('[Telegram Media] Bot file download error:', err.message);
      }
    }

    return new NextResponse('Media not found', { status: 404 });
  } catch (err: any) {
    console.error('[Telegram Media] Error:', err);
    return new NextResponse(err.message || 'Internal Server Error', { status: 500 });
  }
}
