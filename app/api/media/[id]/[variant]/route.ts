import type { NextRequest } from 'next/server';
import { fileResponse } from '@server/http/file-response';
import { viewerOf } from '@server/http/api';
import { locateMediaFile } from '@server/media/media.files';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Streams a resized image, the converted video or the original. Access is checked on every request,
 * so private files stay private.
 */
export async function GET(req: NextRequest, context: { params: Promise<{ id: string; variant: string }> }) {
  const { id, variant } = await context.params;
  return fileResponse(req, await locateMediaFile(id, variant, await viewerOf(req)));
}
