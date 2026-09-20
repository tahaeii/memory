import type { NextRequest } from 'next/server';
import { GUEST, toSessionDto } from '@server/auth/viewer';
import { assertSameOrigin, clearSessionCookie, handle, json } from '@server/http/api';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  return handle(async () => {
    assertSameOrigin(req);
    const res = json(toSessionDto(GUEST));
    clearSessionCookie(res, req);
    return res;
  });
}
