import { NextResponse } from 'next/server';
import { getClientFromSession } from '@/lib/telegram_client';

export const dynamic = 'force-dynamic';

// In-memory cache for avatar buffers: chatId -> { buffer, mime, timestamp }
const avatarCache = new Map<string, { buffer: Buffer; mime: string; timestamp: number }>();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const session = searchParams.get('session');
    const token = searchParams.get('token');

    if (!id) {
      return new NextResponse('Missing id', { status: 400 });
    }

    // 1. Check in-memory cache (valid for 1 hour)
    const cached = avatarCache.get(id);
    if (cached && Date.now() - cached.timestamp < 3600 * 1000) {
      return new NextResponse(new Uint8Array(cached.buffer), {
        headers: {
          'Content-Type': cached.mime,
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
        },
      });
    }

    // 2. Personal Telegram MTProto extraction
    if (session) {
      try {
        const client = await getClientFromSession(session);
        let photoResult: any = null;
        try {
          photoResult = await client.downloadProfilePhoto(id, { isBig: false });
        } catch {
          try {
            const entity = await client.getEntity(id);
            photoResult = await client.downloadProfilePhoto(entity, { isBig: false });
          } catch {
            try {
              const numId = Number(id);
              if (!isNaN(numId)) {
                const entity = await client.getEntity(numId);
                photoResult = await client.downloadProfilePhoto(entity, { isBig: false });
              }
            } catch {}
          }
        }

        let photoBuf: Buffer | null = null;
        if (Buffer.isBuffer(photoResult)) {
          photoBuf = photoResult;
        } else if (typeof photoResult === 'string') {
          photoBuf = Buffer.from(photoResult, 'binary');
        }

        if (photoBuf && photoBuf.length > 0) {
          avatarCache.set(id, { buffer: photoBuf, mime: 'image/jpeg', timestamp: Date.now() });
          return new NextResponse(new Uint8Array(photoBuf), {
            headers: {
              'Content-Type': 'image/jpeg',
              'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
            },
          });
        }
      } catch (err: any) {
        console.warn(`[Telegram Avatar] Failed to download profile photo for ${id}:`, err?.message);
      }
    }

    // 3. Telegram Bot API extraction fallback
    const botToken = token || process.env.TELEGRAM_BOT_TOKEN;
    if (botToken) {
      try {
        // Try user profile photos first
        const userRes = await fetch(`https://api.telegram.org/bot${botToken}/getUserProfilePhotos?user_id=${id}&limit=1`);
        const userData = await userRes.json();
        let fileId = userData?.result?.photos?.[0]?.[0]?.file_id;

        // If not user or no photo, try chat/group photo
        if (!fileId) {
          const chatRes = await fetch(`https://api.telegram.org/bot${botToken}/getChat?chat_id=${id}`);
          const chatData = await chatRes.json();
          fileId = chatData?.result?.photo?.small_file_id || chatData?.result?.photo?.big_file_id;
        }

        if (fileId) {
          const fileRes = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
          const fileData = await fileRes.json();
          const filePath = fileData?.result?.file_path;
          if (filePath) {
            const imgRes = await fetch(`https://api.telegram.org/file/bot${botToken}/${filePath}`);
            if (imgRes.ok) {
              const arrayBuf = await imgRes.arrayBuffer();
              const buffer = Buffer.from(arrayBuf);
              avatarCache.set(id, { buffer, mime: 'image/jpeg', timestamp: Date.now() });
              return new NextResponse(new Uint8Array(buffer), {
                headers: {
                  'Content-Type': 'image/jpeg',
                  'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
                },
              });
            }
          }
        }
      } catch (botErr: any) {
        console.warn(`[Telegram Avatar] Bot API photo error for ${id}:`, botErr?.message);
      }
    }

    return new NextResponse('Profile picture not found', { status: 404 });
  } catch (err: any) {
    return new NextResponse(err?.message || 'Server error', { status: 500 });
  }
}
