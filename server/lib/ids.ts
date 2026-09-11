import { randomBytes } from 'node:crypto';

/** Ids are 12 URL-safe characters (9 random bytes). */
export const ID_PATTERN = /^[A-Za-z0-9_-]{12}$/;

export function newId(): string {
  return randomBytes(9).toString('base64url');
}

export function slugify(text: string): string {
  const base = text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return base || 'event';
}

/** Slugifies `title` and appends -2, -3 … until it does not clash with `taken`. */
export function uniqueSlug(title: string, taken: string[]): string {
  const base = slugify(title);
  let slug = base;
  for (let n = 2; taken.includes(slug); n += 1) slug = base + '-' + n;
  return slug;
}
