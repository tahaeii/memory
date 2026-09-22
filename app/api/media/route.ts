import { createWriteStream, promises as fs } from 'node:fs';
import path from 'node:path';
import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import type { ReadableStream as NodeReadableStream } from 'node:stream/web';
import type { NextRequest } from 'next/server';
import { maxPhotoBytes, maxVideoBytes } from '@server/config';
import { handle, json, parseWith, readBody, requireStaff, viewerOf } from '@server/http/api';
import { HttpError } from '@server/lib/errors';
import { ensureDir } from '@server/lib/fs';
import { newId } from '@server/lib/ids';
import { bulkPatchSchema, idsSchema, listQuerySchema, uploadQuerySchema } from '@server/media/media.schemas';
import {
  assertCanUpload,
  ingestMedia,
  listMedia,
  removeMedia,
  updateMedia,
} from '@server/media/media.service';
import { tmpRoot } from '@server/storage/paths';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Aborts the stream with 413 as soon as it exceeds `maxBytes`. */
function sizeLimit(maxBytes: number): Transform {
  let seen = 0;
  return new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      seen += chunk.length;
      callback(seen > maxBytes ? new HttpError(413, 'This file is too large.') : null, chunk);
    },
  });
}

/**
 * List photos and videos (paginated). Visitors only receive what they may see.
 * With ?deleted=true the super admin gets the items admins deleted instead.
 */
export async function GET(req: NextRequest) {
  return handle(async () => {
    const query = parseWith(listQuerySchema, Object.fromEntries(req.nextUrl.searchParams));
    const page = await listMedia({
      viewer: await viewerOf(req),
      limit: query.limit,
      cursor: query.cursor,
      eventSlug: query.event,
      year: query.year,
      visibility: query.visibility,
      kind: query.kind,
      deleted: query.deleted,
      deletedBy: query.deletedBy,
    });
    return json(page);
  });
}

/**
 * Upload one photo or video (staff). The request body is the raw file, streamed straight to disk;
 * metadata travels in the query string (?name=&visibility=&eventId=&takenAt=).
 */
export async function POST(req: NextRequest) {
  return handle(async () => {
    const viewer = await requireStaff(req);
    const query = parseWith(uploadQuerySchema, Object.fromEntries(req.nextUrl.searchParams));
    assertCanUpload(viewer, query.visibility);
    const limit = Math.max(maxPhotoBytes(), maxVideoBytes());
    if (Number(req.headers.get('content-length')) > limit)
      throw new HttpError(413, 'This file is too large.');
    if (!req.body) throw new HttpError(400, 'No file was sent.');

    await ensureDir(tmpRoot());
    const tmpPath = path.join(tmpRoot(), newId() + '.upload');
    try {
      await pipeline(
        Readable.fromWeb(req.body as unknown as NodeReadableStream),
        sizeLimit(limit),
        createWriteStream(tmpPath),
      );
      const item = await ingestMedia(
        {
          tmpPath,
          name: query.name,
          visibility: query.visibility,
          eventId: query.eventId ?? null,
          takenAtHint: query.takenAt === undefined ? null : new Date(query.takenAt),
        },
        viewer,
      );
      return json(item, 201);
    } finally {
      await fs.rm(tmpPath, { force: true });
    }
  });
}

/** Change visibility and/or event for many items at once (staff). */
export async function PATCH(req: NextRequest) {
  return handle(async () => {
    const viewer = await requireStaff(req);
    const { ids, visibility, eventId } = await readBody(req, bulkPatchSchema);
    return json({ updated: await updateMedia(ids, { visibility, eventId }, viewer) });
  });
}

/**
 * Delete many items (staff). The super admin deletes for good; an admin's deletion only hides the
 * items until the super admin restores or removes them.
 */
export async function DELETE(req: NextRequest) {
  return handle(async () => {
    const viewer = await requireStaff(req);
    const { ids } = await readBody(req, idsSchema);
    return json({ deleted: await removeMedia(ids, viewer) });
  });
}
