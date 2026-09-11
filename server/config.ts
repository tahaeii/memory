import path from 'node:path';

const MB = 1024 * 1024;

function read(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function readPositive(name: string, fallback: number): number {
  const value = Number(read(name));
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

/**
 * Absolute path of the folder that keeps every upload, the accounts and the settings.
 * In Docker, mount a volume here so nothing is lost when the container is replaced.
 */
export function dataDir(): string {
  return path.resolve(process.cwd(), read('DATA_DIR') ?? 'data');
}

/** Largest photo accepted, in bytes (MAX_UPLOAD_MB, default 100). */
export function maxPhotoBytes(): number {
  return readPositive('MAX_UPLOAD_MB', 100) * MB;
}

/** Largest video accepted, in bytes (MAX_VIDEO_UPLOAD_MB, default 2048). */
export function maxVideoBytes(): number {
  return readPositive('MAX_VIDEO_UPLOAD_MB', 2048) * MB;
}

/** Optional fixed signing secret. Without it a random secret is created once and kept in settings.json. */
export function sessionSecretFromEnv(): string | undefined {
  const value = read('SESSION_SECRET');
  return value && value.length >= 32 ? value : undefined;
}

export type CookieSecureMode = 'auto' | 'always' | 'never';

export function cookieSecureMode(): CookieSecureMode {
  const value = read('COOKIE_SECURE')?.toLowerCase();
  return value === 'true' ? 'always' : value === 'false' ? 'never' : 'auto';
}

/** Optional paths to the ffmpeg / ffprobe binaries. By default the ones installed with npm are used. */
export function binaryPathFromEnv(name: 'ffmpeg' | 'ffprobe'): string | undefined {
  return read(name === 'ffmpeg' ? 'FFMPEG_PATH' : 'FFPROBE_PATH');
}

/** Whether X-Real-IP / X-Forwarded-For come from a trusted reverse proxy (TRUST_PROXY, default true). */
export function trustProxy(): boolean {
  return read('TRUST_PROXY')?.toLowerCase() !== 'false';
}

/**
 * Whether the friends area is offered (FRIENDS_ENABLED, default true): a shared passcode that lets
 * people who are not admins see private items. When false, private items are for admins only.
 */
export function friendsEnabled(): boolean {
  return read('FRIENDS_ENABLED')?.toLowerCase() !== 'false';
}
