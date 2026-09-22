import type { NextRequest } from 'next/server';
import { handle, json, readBody, requireSuperAdmin } from '@server/http/api';
import { idsSchema } from '@server/media/media.schemas';
import { restoreMedia } from '@server/media/media.service';

export const dynamic = 'force-dynamic';

/** Puts items an admin deleted back into the library (super admin only). */
export async function POST(req: NextRequest) {
  return handle(async () => {
    const viewer = await requireSuperAdmin(req);
    const { ids } = await readBody(req, idsSchema);
    return json({ restored: await restoreMedia(ids, viewer) });
  });
}
