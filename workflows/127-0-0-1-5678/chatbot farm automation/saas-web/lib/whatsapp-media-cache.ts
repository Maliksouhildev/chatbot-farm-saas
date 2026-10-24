import fs from 'fs';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), '.media_cache');

export interface CachedMedia {
  buffer: Buffer;
  mimetype: string;
  fileName: string;
  timestamp: number;
}

const memoryCache = new Map<string, CachedMedia>();
const MAX_MEM_CACHE = 150;

function sanitizeKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9_-]/g, '_');
}

export function getCachedMedia(key: string): CachedMedia | null {
  const cleanKey = sanitizeKey(key);
  if (memoryCache.has(cleanKey)) {
    return memoryCache.get(cleanKey)!;
  }
  try {
    const metaPath = path.join(CACHE_DIR, `${cleanKey}.json`);
    const dataPath = path.join(CACHE_DIR, `${cleanKey}.bin`);
    if (fs.existsSync(metaPath) && fs.existsSync(dataPath)) {
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
      const buffer = fs.readFileSync(dataPath);
      const item: CachedMedia = {
        buffer,
        mimetype: meta.mimetype || 'image/jpeg',
        fileName: meta.fileName || 'media.jpg',
        timestamp: meta.timestamp || Date.now()
      };
      if (memoryCache.size >= MAX_MEM_CACHE) {
        const firstKey = memoryCache.keys().next().value;
        if (firstKey) memoryCache.delete(firstKey);
      }
      memoryCache.set(cleanKey, item);
      return item;
    }
  } catch {}
  return null;
}

export function setCachedMedia(key: string, item: CachedMedia) {
  const cleanKey = sanitizeKey(key);
  if (memoryCache.size >= MAX_MEM_CACHE) {
    const firstKey = memoryCache.keys().next().value;
    if (firstKey) memoryCache.delete(firstKey);
  }
  memoryCache.set(cleanKey, item);

  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
    const metaPath = path.join(CACHE_DIR, `${cleanKey}.json`);
    const dataPath = path.join(CACHE_DIR, `${cleanKey}.bin`);
    fs.writeFileSync(metaPath, JSON.stringify({
      mimetype: item.mimetype,
      fileName: item.fileName,
      timestamp: item.timestamp
    }));
    fs.writeFileSync(dataPath, item.buffer);
  } catch {}
}
