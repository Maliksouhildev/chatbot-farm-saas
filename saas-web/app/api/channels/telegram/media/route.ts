import { NextResponse } from 'next/server';
import { getClientFromSession } from '@/lib/telegram_client';

export const dynamic = 'force-dynamic';

// In-memory cache for media buffers: key -> { buffer, mime, timestamp }
const mediaCache = new Map<string, { buffer: Buffer; mime: string; timestamp: number }>();

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
    if (cached && Date.now() - cached.timestamp < 3600 * 1000) {
      return new NextResponse(new Uint8Array(cached.buffer), {
        headers: {
          'Content-Type': cached.mime,
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
        },
      });
    }

    const isDownload = searchParams.get('download') === '1';

    // 1. Personal MTProto media download
    if (session && chatId && messageId) {
      try {
        const client = await getClientFromSession(session);
        const msgs = await client.getMessages(chatId, { ids: [Number(messageId)] });
        const media = msgs[0]?.media;
        if (media) {
          const mediaBuf = await client.downloadMedia(media);
          if (mediaBuf) {
            const buf = Buffer.isBuffer(mediaBuf) ? mediaBuf : Buffer.from(mediaBuf as any);
            let mime = 'image/jpeg';
            if ((media as any).document?.mimeType) {
              mime = (media as any).document.mimeType;
            } else if ((media as any).className === 'MessageMediaPhoto') {
              mime = 'image/jpeg';
            }

            mediaCache.set(cacheKey, { buffer: buf, mime, timestamp: Date.now() });
            const headers: Record<string, string> = {
              'Content-Type': mime,
              'Cache-Control': 'public, max-age=86400',
            };
            if (isDownload) {
              headers['Content-Disposition'] = `attachment; filename="telegram_media_${messageId}"`;
            }
            return new NextResponse(new Uint8Array(buf), { headers });
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
          const imgRes = await fetch(`https://api.telegram.org/file/bot${botToken}/${filePath}`);
          if (imgRes.ok) {
            const ab = await imgRes.arrayBuffer();
            const buf = Buffer.from(ab);
            const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
            mediaCache.set(cacheKey, { buffer: buf, mime: contentType, timestamp: Date.now() });
            return new NextResponse(new Uint8Array(buf), {
              headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400',
              },
            });
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
