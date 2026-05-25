import { readFile, writeFile, mkdir, readdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { createHash } from 'crypto';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), 'data', 'aerodatabox-cache');

function hashKey(key: string): string {
  return createHash('md5').update(key).digest('hex');
}

function getPath(key: string): string {
  return path.join(CACHE_DIR, `${hashKey(key)}.json`);
}

export async function getCached<T>(key: string, ttlMs: number): Promise<T | null> {
  const filePath = getPath(key);
  try {
    if (!existsSync(filePath)) return null;
    const raw = await readFile(filePath, 'utf-8');
    const entry = JSON.parse(raw);
    if (entry.expiry > Date.now()) return entry.data as T;
    await unlink(filePath).catch(() => {});
    return null;
  } catch {
    return null;
  }
}

export async function setCache(key: string, data: unknown, ttlMs: number): Promise<void> {
  await mkdir(CACHE_DIR, { recursive: true });
  const entry = { data, expiry: Date.now() + ttlMs };
  await writeFile(getPath(key), JSON.stringify(entry));
}

export async function clearExpired(): Promise<number> {
  let cleared = 0;
  try {
    const files = await readdir(CACHE_DIR);
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      try {
        const raw = await readFile(path.join(CACHE_DIR, file), 'utf-8');
        const entry = JSON.parse(raw);
        if (entry.expiry <= Date.now()) {
          await unlink(path.join(CACHE_DIR, file)).catch(() => {});
          cleared++;
        }
      } catch {
        await unlink(path.join(CACHE_DIR, file)).catch(() => {});
        cleared++;
      }
    }
  } catch {}
  return cleared;
}
