import type { NextRequest } from 'next/server';
import { unlockLimiter } from '@server/auth/limiter';
import { createFriendToken, SESSION_TTL_SECONDS } from '@server/auth/session';
import { FRIEND, toSessionDto } from '@server/auth/viewer';
import {
  assertSameOrigin,
  clientIp,
  handle,
  json,
  readBody,
  setSessionCookie,
  viewerOf,
} from '@server/http/api';
import { friendsEnabled } from '@server/config';
import { HttpError } from '@server/lib/errors';
import { verifyFriendsPasscode } from '@server/settings/settings.service';
import { unlockSchema } from '@server/users/user.schemas';

export const dynamic = 'force-dynamic';

/** Friends unlock the private side with the shared passcode. */
export async function POST(req: NextRequest) {
  return handle(async () => {
    if (!friendsEnabled()) throw new HttpError(404, 'The friends area is switched off on this server.');
    assertSameOrigin(req);
    const viewer = await viewerOf(req);
    if (viewer.role !== 'guest') return json(toSessionDto(viewer));

    const key = clientIp(req);
    if (unlockLimiter.isBlocked(key))
      throw new HttpError(429, 'Too many attempts. Try again in a few minutes.');

    const { passcode } = await readBody(req, unlockSchema);
    if (!(await verifyFriendsPasscode(passcode.trim()))) {
      unlockLimiter.recordFailure(key);
      throw new HttpError(401, 'That passcode is not correct.');
    }

    unlockLimiter.reset(key);
    const res = json(toSessionDto(FRIEND));
    setSessionCookie(res, req, await createFriendToken(), SESSION_TTL_SECONDS.friend);
    return res;
  });
}
