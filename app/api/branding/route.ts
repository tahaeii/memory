import type { NextRequest } from 'next/server';
import { brandingSchema } from '@contracts/schemas/branding';
import { getBranding, updateBranding } from '@server/branding/branding.service';
import { handle, json, readBody, requireSuperAdmin } from '@server/http/api';

export const dynamic = 'force-dynamic';

/** Name, texts and logo address (public: every page shows them). */
export async function GET() {
  return handle(async () => json(await getBranding()));
}

/** Changes the name, the texts and the home page style (super admin only). */
export async function PUT(req: NextRequest) {
  return handle(async () => {
    await requireSuperAdmin(req);
    return json(await updateBranding(await readBody(req, brandingSchema)));
  });
}
