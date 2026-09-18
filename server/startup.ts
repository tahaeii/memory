import { promises as fs } from 'node:fs';
import path from 'node:path';
import { dataDir } from '@server/config';
import { ensureDir } from '@server/lib/fs';
import { videoQueue } from '@server/media/video.queue';
import { checkVideoTools } from '@server/media/video.processor';
import { getSettings } from '@server/settings/settings.service';
import { isSetupComplete, setupCode } from '@server/setup/setup.service';
import { mediaRoot, tmpRoot } from '@server/storage/paths';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Leftovers of uploads that were cut off by a crash or a restart. */
async function cleanTmp(): Promise<void> {
  const now = Date.now();
  for (const name of await fs.readdir(tmpRoot())) {
    const file = path.join(tmpRoot(), name);
    const stat = await fs.stat(file).catch(() => null);
    if (stat?.isFile() && now - stat.mtimeMs > DAY_MS) await fs.rm(file, { force: true });
  }
}

/**
 * Uploads must live outside the application, on a disk that survives redeploys.
 * When DATA_DIR sits on the same filesystem as the app (in Docker: no volume mounted) we say so loudly.
 */
async function checkStorage(): Promise<void> {
  console.info('[storage] Photos, videos and the database are stored in ' + dataDir());
  if (process.env.NODE_ENV !== 'production') return;
  const [data, app] = await Promise.all([fs.stat(dataDir()), fs.stat(process.cwd())]);
  if (data.dev === app.dev) {
    console.warn(
      '[storage] WARNING: ' +
        dataDir() +
        ' is on the same filesystem as the application. In Docker, mount a volume there, ' +
        'otherwise every upload is lost when the container is replaced.',
    );
  }
}

/**
 * Runs once when the Node.js server starts (see instrumentation.ts). Never throws.
 * On a fresh installation it prints the setup code needed on /setup.
 */
export async function startServer(): Promise<void> {
  try {
    await Promise.all([ensureDir(mediaRoot()), ensureDir(tmpRoot())]);
    await checkStorage();
    await Promise.all([getSettings(), cleanTmp()]);
    if (!(await isSetupComplete())) setupCode();
    await checkVideoTools();
    const resumed = await videoQueue.resume();
    if (resumed > 0) console.info('[video] Resumed ' + resumed + ' unfinished conversion(s).');
  } catch (error) {
    console.error('[startup]', error);
  }
}
