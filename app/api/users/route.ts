import type { NextRequest } from 'next/server';
import { handle, json, readBody, requireSuperAdmin } from '@server/http/api';
import { createUserSchema } from '@server/users/user.schemas';
import { createUser, listUsers } from '@server/users/user.service';

export const dynamic = 'force-dynamic';

/** Every staff account (super admin only). */
export async function GET(req: NextRequest) {
  return handle(async () => {
    await requireSuperAdmin(req);
    return json(await listUsers());
  });
}

/** Creates an admin account (super admin only). */
export async function POST(req: NextRequest) {
  return handle(async () => {
    await requireSuperAdmin(req);
    return json(await createUser(await readBody(req, createUserSchema)), 201);
  });
}
