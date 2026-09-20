import type { NextRequest } from 'next/server';
import { toSessionDto } from '@server/auth/viewer';
import { handle, json, viewerOf } from '@server/http/api';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return handle(async () => json(toSessionDto(await viewerOf(req))));
}
