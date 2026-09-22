import type { NextRequest } from 'next/server';
import { handle, json, parseWith, requireStaff } from '@server/http/api';
import { statusQuerySchema } from '@server/media/media.schemas';
import { getMediaByIds } from '@server/media/media.service';

export const dynamic = 'force-dynamic';

/** Fresh state of a few items (?ids=a,b,c). The dashboard polls this while videos are converting. */
export async function GET(req: NextRequest) {
  return handle(async () => {
    const viewer = await requireStaff(req);
    const { ids } = parseWith(statusQuerySchema, Object.fromEntries(req.nextUrl.searchParams));
    return json({ items: await getMediaByIds(ids, viewer) });
  });
}
