import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

const KEY_LENGTH = 64;
const PARAMS = { N: 16384, r: 8, p: 5, maxmem: 64 * 1024 * 1024 };
const HASH_PATTERN = /^s1\.[0-9a-f]{32}\.[0-9a-f]{128}$/;

/** Well-formed, but matches no password. Checked when a username does not exist, so timing stays equal. */
export const UNUSABLE_HASH = 's1.' + '0'.repeat(32) + '.' + '0'.repeat(128);

function derive(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, PARAMS, (error, key) => (error ? reject(error) : resolve(key)));
  });
}

/** Hashes a password with scrypt. Format: s1.<salt hex>.<hash hex>; "s1" names the scheme for future upgrades. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt);
  return ['s1', salt.toString('hex'), key.toString('hex')].join('.');
}

export function isPasswordHash(value: string): boolean {
  return HASH_PATTERN.test(value);
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (!isPasswordHash(stored)) return false;
  const [, saltHex, keyHex] = stored.split('.');
  const expected = Buffer.from(keyHex, 'hex');
  const actual = await derive(password, Buffer.from(saltHex, 'hex'));
  return timingSafeEqual(expected, actual);
}

/** Constant-time string comparison. */
export function safeEqual(a: string, b: string): boolean {
  const left = createHash('sha256').update(a).digest();
  const right = createHash('sha256').update(b).digest();
  return timingSafeEqual(left, right);
}
