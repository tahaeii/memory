import { promises as fs } from 'node:fs';
import path from 'node:path';
import { HttpError } from '@server/lib/errors';
import { Semaphore } from '@server/lib/semaphore';
import { singleton } from '@server/lib/singleton';
import { mediaDir, originalPath, videoPath } from '@server/storage/paths';
import { mediaRepository } from './media.repository';
import type { MediaRecord } from './media.types';
import { convertVideo, probeVideo } from './video.processor';

interface Job {
  controller: AbortController;
  /** 0-1 once the conversion has started, null while waiting. */
  progress: number | null;
}

const GENERIC_FAILURE = 'The video could not be converted. The file may be damaged or use an unusual format.';

function withStatus(
  record: MediaRecord,
  status: 'ready' | 'failed',
  error: string | null,
  duration?: number,
): MediaRecord | null {
  if (!record.video) return null;
  return {
    ...record,
    video: { ...record.video, status, error, duration: duration || record.video.duration },
  };
}

/**
 * Converts uploaded videos to MP4 in the background, one at a time because it is CPU heavy.
 * The "processing" state lives in each meta.json, so after a restart `resume()` simply queues them again.
 */
class VideoQueue {
  private readonly slot = new Semaphore(1);
  private readonly jobs = new Map<string, Job>();

  /** Queues a stored video. Does nothing when it is already queued. */
  add(id: string): void {
    if (this.jobs.has(id)) return;
    const job: Job = { controller: new AbortController(), progress: null };
    this.jobs.set(id, job);
    void this.slot
      .run(() => this.convert(id, job))
      .catch((error: unknown) => console.error('[video] ' + id + ':', error))
      .finally(() => this.jobs.delete(id));
  }

  /** Stops a running or waiting conversion (used when the video is deleted). */
  cancel(id: string): void {
    this.jobs.get(id)?.controller.abort();
  }

  progress(id: string): number | null {
    return this.jobs.get(id)?.progress ?? null;
  }

  /** Queues every video that was still processing when the server stopped. */
  async resume(): Promise<number> {
    const pending = (await mediaRepository.all()).filter(
      (record) => record.kind === 'video' && record.video?.status === 'processing',
    );
    for (const record of pending) this.add(record.id);
    return pending.length;
  }

  private async convert(id: string, job: Job): Promise<void> {
    const { signal } = job.controller;
    const record = await mediaRepository.get(id);
    if (signal.aborted || !record || record.video?.status !== 'processing') return;

    const output = path.join(mediaDir(id), 'video.tmp.mp4');
    try {
      const source = originalPath(id, record.ext);
      const probe = await probeVideo(source);
      if (!probe) throw new HttpError(422, GENERIC_FAILURE);
      job.progress = 0;
      await convertVideo(source, output, probe, { signal, onProgress: (ratio) => (job.progress = ratio) });
      const result = await probeVideo(output);
      if (!result) throw new Error('The converted file could not be read back.');
      await fs.rename(output, videoPath(id));
      await mediaRepository.update(id, (current) => withStatus(current, 'ready', null, result.duration));
    } catch (error) {
      await fs.rm(output, { force: true });
      if (signal.aborted) return;
      console.error('[video] ' + id + ' failed:', error instanceof Error ? error.message : error);
      const message = error instanceof HttpError ? error.message : GENERIC_FAILURE;
      await mediaRepository.update(id, (current) => withStatus(current, 'failed', message));
    }
  }
}

export const videoQueue = singleton('video-queue', () => new VideoQueue());
