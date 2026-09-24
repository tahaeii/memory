/**
 * Returns `value` only when it is a path on this site ("/gallery?year=2026"), else `fallback`.
 * Rejects "//host", "/\host" (browsers treat the backslash as a slash), other schemes and control
 * characters, so a link like /unlock?next=/%5Cevil.example cannot send people to another site.
 */
export function safeInternalPath(value: string | undefined, fallback: string): string {
  if (!value || value.length > 500 || !value.startsWith('/')) return fallback;
  if (value.startsWith('//') || value.includes('\\') || /[\u0000-\u001f\u007f]/.test(value)) return fallback;
  try {
    const base = 'http://internal.invalid';
    const url = new URL(value, base);
    return url.origin === base ? url.pathname + url.search + url.hash : fallback;
  } catch {
    return fallback;
  }
}
