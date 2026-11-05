import type { NextRequest } from 'next/server';
import { accountLimiter, loginLimiter } from '@server/auth/limiter';
import { createStaffToken, SESSION_TTL_SECONDS, viewerFromUser } from '@server/auth/session';
import { toSessionDto } from '@server/auth/viewer';
import { assertSameOrigin, clientIp, handle, json, readBody, setSessionCookie } from '@server/http/api';
import { HttpError } from '@server/lib/errors';
import { loginSchema } from '@contracts/schemas/account';
import { authenticate } from '@server/users/user.service';

export const dynamic = 'force-dynamic';

/** Staff sign-in (admins and the super admin). */
export async function POST(req: NextRequest) {
  return handle(async () => {
    assertSameOrigin(req);
    const key = clientIp(req);
    if (loginLimiter.isBlocked(key))
      throw new HttpError(429, 'Too many attempts. Try again in a few minutes.');

    const { username, password } = await readBody(req, loginSchema);
    const account = username.trim().toLowerCase();
    if (accountLimiter.isBlocked(account))
      throw new HttpError(429, 'Too many attempts. Try again in a few minutes.');
    const user = await authenticate(username, password);
    if (!user) {
      loginLimiter.recordFailure(key);
      accountLimiter.recordFailure(account);
      throw new HttpError(401, 'Invalid username or password.');
    }
    if (!user.active) throw new HttpError(403, 'This account is blocked. Ask the super admin to unblock it.');

    loginLimiter.reset(key);
    accountLimiter.reset(account);
    const res = json(toSessionDto(viewerFromUser(user)));
    setSessionCookie(res, req, await createStaffToken(user), SESSION_TTL_SECONDS.staff);
    return res;
  });
}
