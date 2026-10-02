/** No look-alike characters (0/O, 1/l/I), so the password is easy to read out or type. */
const ALPHABET = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** A random password from the browser's secure random generator. */
export function generatePassword(length = 14): string {
  const values = crypto.getRandomValues(new Uint32Array(length));
  return Array.from(values, (value) => ALPHABET[value % ALPHABET.length]).join('');
}
