import { NextResponse, type NextRequest } from 'next/server';
import type { z, ZodTypeAny } from 'zod';
import { isStaff } from '@server/auth/access';
import { resolveViewer, SESSION_COOKIE } from '@server/auth/session';
import type { Viewer } from '@server/auth/viewer';
import { cookieSecureMode, trustProxy } from '@server/config';
import { HttpError } from '@server/lib/errors';

/** JSON response that is never cached. */
export function json(data: unknown, status = 200): NextResponse {
  return NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
}

/** Runs a route body and turns thrown errors into clean JSON responses. */
export async function handle(run: () => Promise<Response>): Promise<Response> {
  try {
    return await run();
  } catch (error) {
    if (error instanceof HttpError) return json({ error: error.message }, error.status);
    if ((error as NodeJS.ErrnoException)?.code === 'ENOSPC')
      return json({ error: 'The server is out of disk space.' }, 507);
    console.error('[api]', error);
    return json({ error: 'Something went wrong on the server.' }, 500);
  }
}

export function viewerOf(req: NextRequest): Promise<Viewer> {
  return resolveViewer(req.cookies.get(SESSION_COOKIE)?.value);
}

/**
 * Client address for rate limiting. X-Real-IP is set by the reverse proxy; otherwise the last
 * X-Forwarded-For entry is the one the proxy appended (earlier entries come from the client).
 * These headers can only be trusted when every request passes through that proxy: never publish
 * port 3000 itself. With TRUST_PROXY=false (no proxy) they are ignored and all clients share one key.
 */
export function clientIp(req: NextRequest): string {
  if (!trustProxy()) return 'direct';
  const realIp = req.headers.get('x-real-ip')?.trim();
  const forwarded = req.headers.get('x-forwarded-for')?.split(',').pop()?.trim();
  return (realIp || forwarded || 'unknown').slice(0, 64);
}

/** CSRF guard: browsers always send Origin on cross-site writes, and it must match our host. */
export function assertSameOrigin(req: NextRequest): void {
  const origin = req.headers.get('origin');
  if (!origin) return;
  const host = (req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? '').split(',')[0].trim();
  let originHost = '';
  try {
    originHost = new URL(origin).host;
  } catch {
    /* invalid Origin header */
  }
  if (originHost !== host) throw new HttpError(403, 'Cross-origin request blocked.');
}

/** For write routes: same origin and signed in as an admin or the super admin. */
export async function requireStaff(req: NextRequest): Promise<Viewer> {
  assertSameOrigin(req);
  const viewer = await viewerOf(req);
  if (!isStaff(viewer)) throw new HttpError(401, 'Please sign in as an admin.');
  return viewer;
}

export async function requireSuperAdmin(req: NextRequest): Promise<Viewer> {
  const viewer = await requireStaff(req);
  if (viewer.role !== 'superadmin') throw new HttpError(403, 'Only the super admin can do this.');
  return viewer;
}

export function parseWith<S extends ZodTypeAny>(schema: S, raw: unknown): z.infer<S> {
  const result = schema.safeParse(raw);
  if (!result.success) throw new HttpError(400, result.error.issues[0]?.message ?? 'Invalid request.');
  return result.data;
}

export async function readBody<S extends ZodTypeAny>(req: NextRequest, schema: S): Promise<z.infer<S>> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw new HttpError(400, 'Request body must be valid JSON.');
  }
  return parseWith(schema, raw);
}

function isSecure(req: NextRequest): boolean {
  const mode = cookieSecureMode();
  if (mode !== 'auto') return mode === 'always';
  const proto =
    req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() ?? req.nextUrl.protocol.replace(':', '');
  return proto === 'https';
}

export function setSessionCookie(
  res: NextResponse,
  req: NextRequest,
  token: string,
  maxAgeSeconds: number,
): void {
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isSecure(req),
    path: '/',
    maxAge: maxAgeSeconds,
  });
}

export function clearSessionCookie(res: NextResponse, req: NextRequest): void {
  setSessionCookie(res, req, '', 0);
}
