import type { NextRequest } from 'next/server';
import { t } from '@i18n';
import { handle, json, readBody, requireSuperAdmin } from '@server/http/api';
import { HttpError } from '@server/lib/errors';
import { ID_PATTERN } from '@server/lib/ids';
import { updateUserSchema } from '@contracts/schemas/account';
import { updateUser } from '@server/users/user.service';

export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ id: string }> };

/** Blocks/unblocks an admin, toggles private access or sets a new password (super admin only). */
export async function PATCH(req: NextRequest, context: Context) {
  return handle(async () => {
    await requireSuperAdmin(req);
    const { id } = await context.params;
    if (!ID_PATTERN.test(id)) throw new HttpError(404, t('errors.users.notFound'));
    return json(await updateUser(id, await readBody(req, updateUserSchema)));
  });
}
