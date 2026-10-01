import { ApiError } from '@/shared/api/http';
import type { MediaDto, Visibility } from '@/entities/media';

export interface UploadOptions {
  visibility: Visibility;
  eventId: string | null;
}

/** Uploads one file as a raw body (streamed to disk on the server) and reports progress from 0 to 1. */
export function uploadMedia(
  file: File,
  options: UploadOptions,
  onProgress: (ratio: number) => void,
): Promise<MediaDto> {
  return new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      name: file.name,
      visibility: options.visibility,
      takenAt: String(file.lastModified),
    });
    if (options.eventId) params.set('eventId', options.eventId);

    const request = new XMLHttpRequest();
    request.open('POST', '/api/media?' + params.toString());
    request.setRequestHeader('Content-Type', 'application/octet-stream');
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    };
    request.onload = () => {
      let data: { error?: string } | null = null;
      try {
        data = JSON.parse(request.responseText) as { error?: string };
      } catch {
        /* non-JSON error page, e.g. from a proxy */
      }
      if (request.status >= 200 && request.status < 300) resolve(data as unknown as MediaDto);
      else if (request.status === 413 && !data?.error) reject(new ApiError('This file is too large.', 413));
      else reject(new ApiError(data?.error ?? 'Upload failed.', request.status));
    };
    request.onerror = () => reject(new ApiError('Network error. Check your connection.', 0));
    request.send(file);
  });
}
