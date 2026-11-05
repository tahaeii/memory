import type { NextRequest } from 'next/server';
import { handle, json, readBody, requireStaff } from '@server/http/api';
import { friendsEnabled } from '@server/config';
import { HttpError } from '@server/lib/errors';
import { setFriendsPasscode } from '@server/settings/settings.service';
import { passcodeSchema } from '@contracts/schemas/account';

export const dynamic = 'force-dynamic';

/**
 * Sets a new friends passcode. Only staff who can see the private side may do this,
 * otherwise an admin without that access could simply give it to themselves.
 */
export async function PUT(req: NextRequest) {
  return handle(async () => {
    const viewer = await requireStaff(req);
    if (!friendsEnabled()) throw new HttpError(404, 'The friends area is switched off on this server.');
    if (!viewer.privateAccess)
      throw new HttpError(403, 'Only admins with access to the private side can change its passcode.');
    const { passcode } = await readBody(req, passcodeSchema);
    return json(await setFriendsPasscode(passcode));
  });
}
