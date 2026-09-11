import path from 'node:path';
import type { VariantName } from '@contracts/media';
import { dataDir } from '@server/config';
import { ID_PATTERN } from '@server/lib/ids';

const EXT_PATTERN = /^[a-z0-9]{2,5}$/;

/** One folder per photo or video. The name "photos" is kept so existing installations keep working. */
export const mediaRoot = (): string => path.join(dataDir(), 'photos');
export const tmpRoot = (): string => path.join(dataDir(), 'tmp');
export const eventsFile = (): string => path.join(dataDir(), 'events.json');
export const usersFile = (): string => path.join(dataDir(), 'users.json');
export const settingsFile = (): string => path.join(dataDir(), 'settings.json');
export const brandingDir = (): string => path.join(dataDir(), 'branding');
export const logoPath = (): string => path.join(brandingDir(), 'logo.png');

/** Folder of one item: original + resized images (+ video.mp4) + meta.json. */
export function mediaDir(id: string): string {
  if (!ID_PATTERN.test(id)) throw new Error('Invalid media id');
  return path.join(mediaRoot(), id);
}

export const metaPath = (id: string): string => path.join(mediaDir(id), 'meta.json');
export const variantPath = (id: string, variant: VariantName): string =>
  path.join(mediaDir(id), variant + '.webp');
/** Browser-friendly copy of a video. */
export const videoPath = (id: string): string => path.join(mediaDir(id), 'video.mp4');

export function originalPath(id: string, ext: string): string {
  if (!EXT_PATTERN.test(ext)) throw new Error('Invalid file extension');
  return path.join(mediaDir(id), 'original.' + ext);
}
