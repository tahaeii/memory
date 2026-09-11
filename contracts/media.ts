export type Visibility = 'public' | 'private';
export type MediaKind = 'photo' | 'video';
export type VariantName = 'thumb' | 'medium' | 'large';
export type VideoStatus = 'processing' | 'ready' | 'failed';

export interface MediaVariantDto {
  url: string;
  /** Real pixel width of the file (used for srcset). */
  width: number;
}

export interface VideoDto {
  /** Browser-friendly MP4. Null until the server has finished converting the upload. */
  url: string | null;
  /** Length in seconds (0 when unknown). */
  duration: number;
  status: VideoStatus;
  /** Conversion progress from 0 to 1 while processing. Only sent to staff. */
  progress: number | null;
  /** Why the conversion failed. Only sent to staff. */
  error: string | null;
}

/** Who removed an item and when. Only the super admin ever receives it. */
export interface DeletionDto {
  at: string;
  /** Username of the admin who deleted it. */
  by: string;
}

export interface MediaDto {
  id: string;
  kind: MediaKind;
  name: string;
  width: number;
  height: number;
  /** ISO timestamp of when the photo or video was taken. */
  takenAt: string;
  visibility: Visibility;
  event: { slug: string; title: string } | null;
  /** Tiny base64 WebP shown while the real image loads. */
  placeholder: string;
  /** Resized WebP images. For videos these are made from a frame of the video. */
  variants: Record<VariantName, MediaVariantDto>;
  video: VideoDto | null;
  /** Link to the untouched original. Only sent to staff. */
  originalUrl: string | null;
  /** Set on items an admin deleted (shown to the super admin in "Deleted"). */
  deletion: DeletionDto | null;
}

export interface MediaPageDto {
  items: MediaDto[];
  nextCursor: string | null;
  total: number;
}

/** Filters accepted by the gallery. `event` is an event slug. */
export interface MediaFilters {
  event?: string;
  year?: number;
  visibility?: Visibility;
  kind?: MediaKind;
  /** Super admin only: list the items admins deleted instead of the library. */
  deleted?: boolean;
  /** With `deleted`: only items deleted by this user id. */
  deletedBy?: string;
}

export interface LibrarySummaryDto {
  itemCount: number;
  photoCount: number;
  videoCount: number;
  publicCount: number;
  privateCount: number;
  years: number[];
  /** Total size of the originals. Only filled for staff. */
  totalBytes: number;
  /** Items admins deleted that wait for the super admin. Only filled for the super admin. */
  deletedCount: number;
}

export interface BulkMediaPatch {
  visibility?: Visibility;
  eventId?: string | null;
}
