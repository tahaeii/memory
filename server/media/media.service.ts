import { promises as fs } from 'node:fs';
import path from 'node:path';
import { t } from '@i18n';
import type {
  BulkMediaPatch,
  LibrarySummaryDto,
  MediaDto,
  MediaKind,
  MediaPageDto,
  Visibility,
} from '@contracts/media';
import { canManage, isStaff } from '@server/auth/access';
import type { Viewer } from '@server/auth/viewer';
import { maxPhotoBytes, maxVideoBytes } from '@server/config';
import { eventRepository } from '@server/events/event.repository';
import { HttpError } from '@server/lib/errors';
import { newId } from '@server/lib/ids';
import { Semaphore } from '@server/lib/semaphore';
import { singleton } from '@server/lib/singleton';
import { mediaDir, originalPath } from '@server/storage/paths';
import { pickTakenAt, processImage, readTakenAt } from './image.processor';
import { canReviewDeleted, isVisibleTo } from './media.access';
import { UNSUPPORTED_FILE } from './media.constants';
import { detectMedia } from './media.detect';
import { toMediaDto } from './media.mapper';
import { mediaRepository } from './media.repository';
import type { DeletionInfo, MediaRecord } from './media.types';
import { extractPoster } from './video.processor';
import { videoQueue } from './video.queue';

/** At most two images are decoded/resized at once to keep memory predictable. */
const processing = singleton('image-processing', () => new Semaphore(2));

/** Types of the stored video originals, by file extension. */
const VIDEO_TYPES: Record<string, string> = {
  mp4: 'video/mp4',
  m4v: 'video/x-m4v',
  mov: 'video/quicktime',
  webm: 'video/webm',
  mkv: 'video/x-matroska',
  avi: 'video/x-msvideo',
  wmv: 'video/x-ms-wmv',
  asf: 'video/x-ms-asf',
  flv: 'video/x-flv',
  '3gp': 'video/3gpp',
  '3g2': 'video/3gpp2',
  mpg: 'video/mpeg',
  mpeg: 'video/mpeg',
  ts: 'video/mp2t',
  mts: 'video/mp2t',
  m2ts: 'video/mp2t',
  ogv: 'video/ogg',
};

/** Extension for a video original: the uploaded name's if it is a known one, else from the container. */
function videoExtension(name: string, container: string): string {
  const fromName = path.extname(name).slice(1).toLowerCase();
  if (VIDEO_TYPES[fromName]) return fromName;
  const formats = container.split(',');
  if (formats.includes('matroska')) return 'mkv';
  if (formats.includes('asf')) return 'wmv';
  if (formats.includes('mpegts')) return 'ts';
  if (formats.includes('mpeg')) return 'mpg';
  if (formats.includes('ogg')) return 'ogv';
  if (formats.includes('avi') || formats.includes('flv')) return formats[0];
  return 'mp4';
}

function cleanName(name: string): string {
  return (
    name
      .replace(/[\\/\x00-\x1f]/g, '')
      .trim()
      .slice(0, 200) || 'upload'
  );
}

async function toDtos(records: readonly MediaRecord[], viewer: Viewer): Promise<MediaDto[]> {
  const events = new Map((await eventRepository.all()).map((event) => [event.id, event]));
  return records.map((record) =>
    toMediaDto(record, events.get(record.eventId ?? '') ?? null, viewer, videoQueue.progress(record.id)),
  );
}

/** Lists are sorted by a text key (newest first), ties broken by id; cursors point after the last item. */
type SortKey = (record: MediaRecord) => string;
const byTakenAt: SortKey = (record) => record.takenAt;
const byDeletedAt: SortKey = (record) => record.deleted?.at ?? '';

function encodeCursor(key: SortKey, record: MediaRecord): string {
  return Buffer.from(key(record) + '|' + record.id).toString('base64url');
}

function decodeCursor(value: string): { key: string; id: string } | null {
  const [key, id] = Buffer.from(value, 'base64url').toString('utf8').split('|');
  return key && id ? { key, id } : null;
}

function newestFirst(key: SortKey) {
  return (a: MediaRecord, b: MediaRecord): number =>
    key(a) !== key(b) ? (key(a) < key(b) ? 1 : -1) : a.id < b.id ? 1 : a.id > b.id ? -1 : 0;
}

async function toPage(
  matches: readonly MediaRecord[],
  key: SortKey,
  params: { viewer: Viewer; limit: number; cursor?: string },
): Promise<MediaPageDto> {
  const cursor = params.cursor ? decodeCursor(params.cursor) : null;
  const isAfterCursor = (record: MediaRecord): boolean =>
    !!cursor && (key(record) < cursor.key || (key(record) === cursor.key && record.id < cursor.id));
  const found = cursor ? matches.findIndex(isAfterCursor) : 0;
  const from = found === -1 ? matches.length : found;
  const slice = matches.slice(from, from + params.limit);
  const hasMore = from + params.limit < matches.length;
  return {
    items: await toDtos(slice, params.viewer),
    nextCursor: hasMore && slice.length > 0 ? encodeCursor(key, slice[slice.length - 1]) : null,
    total: matches.length,
  };
}

export interface ListParams {
  viewer: Viewer;
  limit: number;
  cursor?: string;
  eventSlug?: string;
  year?: number;
  visibility?: Visibility;
  kind?: MediaKind;
  /** List the items admins deleted (super admin only). */
  deleted?: boolean;
  deletedBy?: string;
}

/** One page of items, newest first, filtered by what the viewer may see. Uses keyset pagination. */
export async function listMedia(params: ListParams): Promise<MediaPageDto> {
  if (params.deleted) return listDeleted(params);
  const [all, event] = await Promise.all([
    mediaRepository.all(),
    params.eventSlug ? eventRepository.getBySlug(params.eventSlug) : Promise.resolve(null),
  ]);
  const unknownEvent = Boolean(params.eventSlug) && !event;
  const matches = unknownEvent
    ? []
    : all.filter(
        (record) =>
          isVisibleTo(record, params.viewer) &&
          (!event || record.eventId === event.id) &&
          (params.kind === undefined || record.kind === params.kind) &&
          (params.visibility === undefined || record.visibility === params.visibility) &&
          (params.year === undefined || record.takenAt.startsWith(String(params.year))),
      );

  return toPage(matches, byTakenAt, params);
}

/** What admins deleted, most recently deleted first, optionally only one admin's deletions. */
async function listDeleted(params: ListParams): Promise<MediaPageDto> {
  if (!canReviewDeleted(params.viewer)) throw new HttpError(403, t('errors.media.deletedSuperAdminOnly'));
  const matches = (await mediaRepository.all())
    .filter(
      (record) =>
        record.deleted &&
        (!params.deletedBy || record.deleted.userId === params.deletedBy) &&
        (params.kind === undefined || record.kind === params.kind),
    )
    .sort(newestFirst(byDeletedAt));
  return toPage(matches, byDeletedAt, params);
}

/** Fresh copies of a few items (staff poll this while videos are converting). */
export async function getMediaByIds(ids: string[], viewer: Viewer): Promise<MediaDto[]> {
  const records = await Promise.all([...new Set(ids)].map((id) => mediaRepository.get(id)));
  return toDtos(
    records.filter((record): record is MediaRecord => record !== null && isVisibleTo(record, viewer)),
    viewer,
  );
}

export async function getSummary(viewer: Viewer): Promise<LibrarySummaryDto> {
  const all = await mediaRepository.all();
  const visible = all.filter((record) => isVisibleTo(record, viewer));
  const years = [...new Set(visible.map((record) => Number(record.takenAt.slice(0, 4))))].sort(
    (a, b) => b - a,
  );
  const videoCount = visible.filter((record) => record.kind === 'video').length;
  const privateCount = visible.filter((record) => record.visibility === 'private').length;
  return {
    itemCount: visible.length,
    photoCount: visible.length - videoCount,
    videoCount,
    publicCount: visible.length - privateCount,
    privateCount,
    years,
    totalBytes: isStaff(viewer) ? visible.reduce((sum, record) => sum + record.bytes, 0) : 0,
    deletedCount: canReviewDeleted(viewer) ? all.filter((record) => record.deleted).length : 0,
  };
}

/** Staff without friends access may only upload public items. */
export function assertCanUpload(viewer: Viewer, visibility: Visibility): void {
  if (!isStaff(viewer)) throw new HttpError(401, t('errors.auth.staffOnly'));
  if (!canManage(viewer, visibility)) throw new HttpError(403, t('errors.media.cannotAddPrivate'));
}

export interface IngestInput {
  /** File already written to disk (inside DATA_DIR so it can be moved atomically). */
  tmpPath: string;
  name: string;
  visibility: Visibility;
  eventId: string | null;
  takenAtHint: Date | null;
}

/**
 * Validates and stores one upload. Photos are resized right away; videos get their preview images
 * now and are converted in the background. Cleans up after itself on failure.
 */
export async function ingestMedia(input: IngestInput, viewer: Viewer): Promise<MediaDto> {
  assertCanUpload(viewer, input.visibility);
  if (input.eventId && !(await eventRepository.get(input.eventId)))
    throw new HttpError(404, t('errors.events.notFound'));

  const { size } = await fs.stat(input.tmpPath);
  const detected = await detectMedia(input.tmpPath);
  if (!detected) throw new HttpError(415, UNSUPPORTED_FILE);
  if (size > (detected.kind === 'video' ? maxVideoBytes() : maxPhotoBytes()))
    throw new HttpError(413, t('errors.media.tooLarge'));

  const id = newId();
  const dir = mediaDir(id);
  await fs.mkdir(dir, { recursive: true });
  try {
    const base = {
      id,
      name: cleanName(input.name),
      bytes: size,
      createdAt: new Date().toISOString(),
      visibility: input.visibility,
      eventId: input.eventId,
    };
    let record: MediaRecord;

    if (detected.kind === 'photo') {
      const image = await processing.run(() => processImage(input.tmpPath, detected.decoder, dir));
      record = {
        ...base,
        kind: 'photo',
        ...detected.format,
        width: image.width,
        height: image.height,
        takenAt: pickTakenAt(await readTakenAt(input.tmpPath), input.takenAtHint).toISOString(),
        placeholder: image.placeholder,
      };
    } else {
      const { probe } = detected;
      const poster = path.join(dir, 'poster.png');
      const image = await processing.run(async () => {
        await extractPoster(input.tmpPath, probe, poster);
        return processImage(poster, 'sharp', dir);
      });
      await fs.rm(poster, { force: true });
      const ext = videoExtension(input.name, probe.container);
      record = {
        ...base,
        kind: 'video',
        ext,
        mime: VIDEO_TYPES[ext] ?? 'application/octet-stream',
        width: probe.width,
        height: probe.height,
        takenAt: pickTakenAt(probe.recordedAt, input.takenAtHint).toISOString(),
        placeholder: image.placeholder,
        video: { duration: probe.duration, status: 'processing', error: null },
      };
    }

    await fs.rename(input.tmpPath, originalPath(id, record.ext));
    await mediaRepository.insert(record);
    if (record.kind === 'video') videoQueue.add(id);
    return (await toDtos([record], viewer))[0];
  } catch (error) {
    await fs.rm(dir, { recursive: true, force: true });
    throw error;
  }
}

/** Changes visibility and/or event for the given items the viewer may manage. Returns how many changed. */
export async function updateMedia(ids: string[], patch: BulkMediaPatch, viewer: Viewer): Promise<number> {
  if (patch.visibility === 'private' && !viewer.privateAccess)
    throw new HttpError(403, t('errors.media.cannotMakePrivate'));
  if (patch.eventId && !(await eventRepository.get(patch.eventId)))
    throw new HttpError(404, t('errors.events.notFound'));

  let updated = 0;
  for (const id of new Set(ids)) {
    const next = await mediaRepository.update(id, (record) =>
      isVisibleTo(record, viewer) && canManage(viewer, record.visibility)
        ? {
            ...record,
            visibility: patch.visibility ?? record.visibility,
            eventId: patch.eventId === undefined ? record.eventId : patch.eventId,
          }
        : null,
    );
    if (next) updated += 1;
  }
  return updated;
}

/**
 * Deletes items. The super admin removes them for good, files included. An admin only hides them:
 * they disappear for everyone and wait in the super admin's "Deleted" list, with who deleted them and
 * when, until they are restored or removed. Either way the caller is told how many were deleted.
 */
export async function removeMedia(ids: string[], viewer: Viewer): Promise<number> {
  return canReviewDeleted(viewer) ? purgeMedia(ids) : hideMedia(ids, viewer);
}

async function hideMedia(ids: string[], viewer: Viewer): Promise<number> {
  const deleted: DeletionInfo = {
    at: new Date().toISOString(),
    userId: viewer.userId,
    username: viewer.username ?? 'unknown',
  };
  let hidden = 0;
  for (const id of new Set(ids)) {
    const next = await mediaRepository.update(id, (record) =>
      isVisibleTo(record, viewer) && canManage(viewer, record.visibility) ? { ...record, deleted } : null,
    );
    if (next) hidden += 1;
  }
  return hidden;
}

async function purgeMedia(ids: string[]): Promise<number> {
  let removed = 0;
  for (const id of new Set(ids)) {
    videoQueue.cancel(id);
    if (await mediaRepository.remove(id)) removed += 1;
  }
  return removed;
}

/** Puts items an admin deleted back into the library, exactly as they were (super admin only). */
export async function restoreMedia(ids: string[], viewer: Viewer): Promise<number> {
  if (!canReviewDeleted(viewer)) throw new HttpError(403, t('errors.media.restoreSuperAdminOnly'));
  let restored = 0;
  for (const id of new Set(ids)) {
    const next = await mediaRepository.update(id, (record) => {
      if (!record.deleted) return null;
      const copy = { ...record };
      delete copy.deleted;
      return copy;
    });
    if (next) restored += 1;
  }
  return restored;
}
