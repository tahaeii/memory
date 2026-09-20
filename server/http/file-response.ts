import { createReadStream, promises as fs } from 'node:fs';
import { Readable } from 'node:stream';
import type { MediaFile } from '@server/media/media.files';

export interface ByteRange {
  start: number;
  end: number;
}

/**
 * Parses a single "Range: bytes=…" header. Returns null to send the whole file (no header, several
 * ranges, or anything we do not understand) and "unsatisfiable" for a range outside the file.
 */
export function parseRange(header: string | null, size: number): ByteRange | null | 'unsatisfiable' {
  const match = header ? /^bytes=(\d*)-(\d*)$/.exec(header.trim()) : null;
  if (!match || (!match[1] && !match[2])) return null;
  let start: number;
  let end: number;
  if (!match[1]) {
    const suffix = Number(match[2]);
    if (suffix === 0) return 'unsatisfiable';
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
  }
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= size)
    return 'unsatisfiable';
  return { start, end };
}

const notFound = (): Response =>
  new Response('Not found', { status: 404, headers: { 'Cache-Control': 'no-store' } });

function contentDisposition(name: string): string {
  const encoded = encodeURIComponent(name).replace(
    /['()*]/g,
    (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase(),
  );
  return "attachment; filename*=UTF-8''" + encoded;
}

function stream(path: string, range?: ByteRange): ReadableStream {
  return Readable.toWeb(createReadStream(path, range)) as unknown as ReadableStream;
}

/**
 * Streams a stored file with caching headers and byte-range support
 * (browsers need ranges to seek in videos, and Safari will not play a video without them).
 */
export async function fileResponse(req: Request, file: MediaFile | null): Promise<Response> {
  const stat = file ? await fs.stat(file.path).catch(() => null) : null;
  if (!file || !stat?.isFile()) return notFound();

  const etag = 'W/"' + stat.size + '-' + Math.floor(stat.mtimeMs) + '"';
  const headers = new Headers({
    ETag: etag,
    'Accept-Ranges': 'bytes',
    // Never stored by shared caches, and kept briefly by browsers: making an item private or deleting
    // it must take effect quickly. Private files are re-checked on every view (a cheap 304), so they
    // disappear from a shared computer as soon as the friend locks the private side again.
    'Cache-Control': file.isPublic ? 'private, max-age=3600' : 'private, no-cache',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'X-Content-Type-Options': 'nosniff',
  });
  if (file.downloadName) headers.set('Content-Disposition', contentDisposition(file.downloadName));

  const ifNoneMatch = req.headers.get('if-none-match');
  if (ifNoneMatch && ifNoneMatch.split(',').some((tag) => tag.trim() === etag))
    return new Response(null, { status: 304, headers });

  headers.set('Content-Type', file.mime);
  const range = parseRange(req.headers.get('range'), stat.size);
  if (range === 'unsatisfiable') {
    headers.set('Content-Range', 'bytes */' + stat.size);
    return new Response(null, { status: 416, headers });
  }
  if (range) {
    headers.set('Content-Range', 'bytes ' + range.start + '-' + range.end + '/' + stat.size);
    headers.set('Content-Length', String(range.end - range.start + 1));
    return new Response(stream(file.path, range), { status: 206, headers });
  }
  headers.set('Content-Length', String(stat.size));
  return new Response(stream(file.path), { headers });
}
