import type { MediaKind, VideoStatus, Visibility } from '@contracts/media';

export interface VideoInfo {
  /** Seconds; 0 when unknown. */
  duration: number;
  status: VideoStatus;
  /** Shown to staff when the conversion failed. */
  error: string | null;
}

/** Set when an admin deletes an item: it is hidden, not removed, until the super admin decides. */
export interface DeletionInfo {
  at: string;
  userId: string | null;
  username: string;
}

/** What is stored in <item folder>/meta.json. */
export interface MediaRecord {
  id: string;
  kind: MediaKind;
  /** Original file name (sanitised). */
  name: string;
  /** Extension and type of the stored original. */
  ext: string;
  mime: string;
  /** Size of the original, in bytes. */
  bytes: number;
  /** Display size, with EXIF orientation / video rotation applied. */
  width: number;
  height: number;
  takenAt: string;
  createdAt: string;
  visibility: Visibility;
  eventId: string | null;
  placeholder: string;
  /** Only on videos. */
  video?: VideoInfo;
  /** Only on items an admin deleted. */
  deleted?: DeletionInfo;
}
