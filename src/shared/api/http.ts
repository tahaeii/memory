import { t } from '@i18n';

/** Error thrown for every non-2xx response from our API. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  json?: unknown;
  /** A raw body (e.g. an image file); sent as is. */
  file?: Blob;
}

/** Browser-side fetch helper for our own /api routes (cookies are sent automatically). */
export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const hasBody = options.json !== undefined;
  const response = await fetch('/api' + path, {
    method: options.method ?? 'GET',
    headers: options.file
      ? { 'Content-Type': options.file.type || 'application/octet-stream' }
      : hasBody
        ? { 'Content-Type': 'application/json' }
        : undefined,
    body: options.file ?? (hasBody ? JSON.stringify(options.json) : undefined),
    credentials: 'same-origin',
  });
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = (data as { error?: unknown } | null)?.error;
    throw new ApiError(
      typeof message === 'string' ? message : t('common.errors.requestFailed'),
      response.status,
    );
  }
  return data as T;
}
