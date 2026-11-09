import { NextResponse, type NextRequest } from 'next/server';
import { t } from '@i18n';
import { MAX_LOGO_BYTES, readLogo, removeLogo, saveLogo } from '@server/branding/branding.service';
import { handle, json, requireSuperAdmin } from '@server/http/api';
import { HttpError } from '@server/lib/errors';

export const dynamic = 'force-dynamic';

/** The uploaded logo as PNG. Its address carries a version, so browsers may keep it for good. */
export async function GET(req: NextRequest) {
  return handle(async () => {
    const logo = await readLogo();
    if (!logo) return NextResponse.redirect(new URL('/icon.svg', req.url), 307);
    return new NextResponse(new Uint8Array(logo), {
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': String(logo.length),
        'Cache-Control': req.nextUrl.searchParams.has('v')
          ? 'public, max-age=31536000, immutable'
          : 'public, max-age=300',
        'Cross-Origin-Resource-Policy': 'same-origin',
      },
    });
  });
}

/** Uploads a new logo: the raw image is the request body (super admin only). */
export async function PUT(req: NextRequest) {
  return handle(async () => {
    await requireSuperAdmin(req);
    const declared = Number(req.headers.get('content-length') ?? 0);
    if (declared > MAX_LOGO_BYTES) throw new HttpError(413, t('errors.logo.tooLarge'));
    const bytes = Buffer.from(await req.arrayBuffer());
    return json(await saveLogo(bytes));
  });
}

/** Goes back to the bundled logo (super admin only). */
export async function DELETE(req: NextRequest) {
  return handle(async () => {
    await requireSuperAdmin(req);
    return json(await removeLogo());
  });
}
