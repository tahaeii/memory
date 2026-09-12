import { createHmac, timingSafeEqual } from 'node:crypto';

export interface TokenClaims {
  /** A staff user id, or "friend". */
  sub: string;
  /** Expiry, in seconds since the epoch. */
  exp: number;
  /** Fingerprint of the credential behind the session; when it changes, the token stops working. */
  v: string;
}

function sign(body: string, secret: string): string {
  return createHmac('sha256', secret).update(body).digest('base64url');
}

/** Creates a compact HMAC-signed token: <base64url payload>.<signature>. */
export function signToken(claims: TokenClaims, secret: string): string {
  const body = Buffer.from(JSON.stringify(claims)).toString('base64url');
  return body + '.' + sign(body, secret);
}

/** Returns the claims when the signature is valid and the token has not expired. */
export function verifyToken(token: string, secret: string): TokenClaims | null {
  const [body, signature, extra] = token.split('.');
  if (!body || !signature || extra !== undefined) return null;
  const expected = Buffer.from(sign(body, secret));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const claims = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as Partial<TokenClaims>;
    if (typeof claims.sub !== 'string' || typeof claims.v !== 'string' || typeof claims.exp !== 'number')
      return null;
    return claims.exp * 1000 > Date.now() ? (claims as TokenClaims) : null;
  } catch {
    return null;
  }
}
