import { randomBytes } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';

export async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

/**
 * Writes JSON to a temp file, flushes it to disk, then renames it over the target,
 * so a crash or power cut never leaves a half-written file behind.
 */
export async function writeJsonAtomic(file: string, data: unknown, mode = 0o644): Promise<void> {
  await ensureDir(path.dirname(file));
  const temp = file + '.' + randomBytes(4).toString('hex') + '.tmp';
  try {
    const handle = await fs.open(temp, 'w', mode);
    try {
      await handle.writeFile(JSON.stringify(data));
      await handle.sync();
    } finally {
      await handle.close();
    }
    await fs.rename(temp, file);
  } catch (error) {
    await fs.rm(temp, { force: true });
    throw error;
  }
}

/** Returns null when the file does not exist. A broken file throws, so it is never silently replaced. */
export async function readJson<T>(file: string): Promise<T | null> {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8')) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
}

export async function fileExists(file: string): Promise<boolean> {
  try {
    return (await fs.stat(file)).isFile();
  } catch {
    return false;
  }
}
