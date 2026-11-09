import type { NextRequest } from 'next/server';
import { t } from '@i18n';
import { setupLimiter } from '@server/auth/limiter';
import { createStaffToken, SESSION_TTL_SECONDS, viewerFromUser } from '@server/auth/session';
import { toSessionDto } from '@server/auth/viewer';
import { assertSameOrigin, clientIp, handle, json, readBody, setSessionCookie } from '@server/http/api';
import { HttpError } from '@server/lib/errors';
import { completeSetup } from '@server/setup/setup.service';
import { setupSchema } from '@contracts/schemas/account';

export const dynamic = 'force-dynamic';

/** First start only: creates the super admin, the friends passcode and the name, then signs the super admin in. */
export async function POST(req: NextRequest) {
  return handle(async () => {
    assertSameOrigin(req);
    const key = clientIp(req);
    if (setupLimiter.isBlocked(key)) throw new HttpError(429, t('errors.tooManyAttempts'));

    const input = await readBody(req, setupSchema);
    const user = await completeSetup(input).catch((error: unknown) => {
      if (error instanceof HttpError && error.status === 403) setupLimiter.recordFailure(key);
      throw error;
    });

    setupLimiter.reset(key);
    const res = json(toSessionDto(viewerFromUser(user)), 201);
    setSessionCookie(res, req, await createStaffToken(user), SESSION_TTL_SECONDS.staff);
    return res;
  });
}
