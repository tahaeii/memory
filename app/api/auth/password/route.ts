import type { NextRequest } from 'next/server';
import { t } from '@i18n';
import { passwordLimiter } from '@server/auth/limiter';
import { createStaffToken, SESSION_TTL_SECONDS } from '@server/auth/session';
import { handle, json, readBody, requireStaff, setSessionCookie } from '@server/http/api';
import { HttpError } from '@server/lib/errors';
import { changePasswordSchema } from '@contracts/schemas/account';
import { changeOwnPassword, toUserDto } from '@server/users/user.service';

export const dynamic = 'force-dynamic';

/** Changes the signed-in user's password. This device stays signed in; every other session ends. */
export async function POST(req: NextRequest) {
  return handle(async () => {
    const viewer = await requireStaff(req);
    if (!viewer.userId) throw new HttpError(401, t('errors.auth.signInAgain'));
    const key = viewer.userId;
    if (passwordLimiter.isBlocked(key)) throw new HttpError(429, t('errors.tooManyAttempts'));

    const { currentPassword, newPassword } = await readBody(req, changePasswordSchema);
    const user = await changeOwnPassword(viewer.userId, currentPassword, newPassword);
    if (!user) {
      passwordLimiter.recordFailure(key);
      throw new HttpError(400, t('errors.auth.wrongCurrentPassword'));
    }

    passwordLimiter.reset(key);
    const res = json(toUserDto(user));
    setSessionCookie(res, req, await createStaffToken(user), SESSION_TTL_SECONDS.staff);
    return res;
  });
}
