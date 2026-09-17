import type { VariantName } from '@contracts/media';

/** Derived WebP sizes generated for every upload (width in pixels). Videos get them from a frame. */
export const VARIANTS: Record<VariantName, { width: number; quality: number }> = {
  thumb: { width: 480, quality: 72 },
  medium: { width: 1280, quality: 78 },
  large: { width: 2560, quality: 80 },
};

export const VARIANT_NAMES = Object.keys(VARIANTS) as VariantName[];

export function isVariantName(value: string): value is VariantName {
  return VARIANT_NAMES.includes(value as VariantName);
}

export const UNSUPPORTED_FILE =
  'Unsupported file. Upload JPEG, PNG, HEIC, WebP, AVIF, GIF or TIFF photos, or MP4, MOV, WebM, MKV, AVI, WMV, 3GP or MPEG videos.';
