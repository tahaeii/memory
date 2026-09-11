import type { MediaDto } from './media';

export interface EventDto {
  id: string;
  slug: string;
  title: string;
  description: string;
  /** Calendar date, YYYY-MM-DD. */
  date: string;
  /** Number of photos the current viewer is allowed to see. */
  photoCount: number;
  /** Number of videos the current viewer is allowed to see. */
  videoCount: number;
  cover: MediaDto | null;
}

export interface EventInput {
  title: string;
  date: string;
  description: string;
}
