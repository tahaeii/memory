'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { MediaKind } from '@/entities/media';
import { messageOf } from '@/shared/lib/error-message';
import { uploadMedia, type UploadOptions } from '../api/upload-media';

export interface UploadItem {
  id: string;
  file: File;
  status: 'queued' | 'uploading' | 'done' | 'error';
  progress: number;
  /** What the server stored, once done. */
  kind?: MediaKind;
  error?: string;
}

const CONCURRENCY = 3;
/** Browsers often leave `file.type` empty for HEIC and less common video formats, so check the name too. */
const MEDIA_NAME =
  /\.(jpe?g|png|webp|avif|gif|tiff?|heic|heif|mp4|m4v|mov|webm|mkv|avi|wmv|asf|flv|3gp|3g2|mpe?g|ts|mts|m2ts|ogv)$/i;
let sequence = 0;

const isMedia = (file: File): boolean =>
  file.type.startsWith('image/') || file.type.startsWith('video/') || MEDIA_NAME.test(file.name);

/** Uploads several files at once (3 in parallel) and tracks progress for each. */
export function useUploadQueue(options: UploadOptions, onFinished: () => void) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const optionsRef = useRef(options);
  const finishedRef = useRef(onFinished);

  useEffect(() => {
    optionsRef.current = options;
    finishedRef.current = onFinished;
  });

  const patch = useCallback((id: string, changes: Partial<UploadItem>) => {
    setItems((previous) => previous.map((item) => (item.id === id ? { ...item, ...changes } : item)));
  }, []);

  const addFiles = useCallback(
    (files: File[]) => {
      if (files.length === 0) return;
      const entries = files.map((file): UploadItem => {
        const id = 'upload-' + ++sequence;
        return isMedia(file)
          ? { id, file, status: 'queued', progress: 0 }
          : { id, file, status: 'error', progress: 0, error: 'Not a photo or video.' };
      });
      setItems((previous) => [...previous, ...entries]);

      const batch = entries.filter((entry) => entry.status === 'queued');
      if (batch.length === 0) return;
      const settings = { ...optionsRef.current };
      let next = 0;
      const worker = async () => {
        while (next < batch.length) {
          const item = batch[next++];
          patch(item.id, { status: 'uploading' });
          try {
            const stored = await uploadMedia(item.file, settings, (progress) => patch(item.id, { progress }));
            patch(item.id, { status: 'done', progress: 1, kind: stored.kind });
          } catch (caught) {
            patch(item.id, { status: 'error', error: messageOf(caught, 'Upload failed.') });
          }
        }
      };
      void Promise.all(Array.from({ length: Math.min(CONCURRENCY, batch.length) }, worker)).then(() =>
        finishedRef.current(),
      );
    },
    [patch],
  );

  const clearFinished = useCallback(() => {
    setItems((previous) =>
      previous.filter((item) => item.status === 'queued' || item.status === 'uploading'),
    );
  }, []);

  return { items, addFiles, clearFinished };
}
