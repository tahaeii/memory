import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp, { Metadata, Sharp, type SharpOptions } from 'sharp';
import { t } from '@i18n';
import { HttpError } from '@server/lib/errors';
import { UNSUPPORTED_FILE, VARIANTS, VARIANT_NAMES } from './media.constants';

// Do not keep files open between operations (lets us move the original afterwards, also on Windows).
sharp.cache(false);

// exifr ships untyped CommonJS builds; a tiny typed wrapper keeps the rest of the code strict.
type ExifParse = (input: string, tags: string[]) => Promise<Record<string, unknown> | undefined>;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { parse: parseExif } = require('exifr') as { parse: ExifParse };

const MAX_PIXELS = 200_000_000;
const SHARP_OPTIONS: SharpOptions = { failOn: 'error', limitInputPixels: MAX_PIXELS };

export interface ImageFormat {
  ext: string;
  mime: string;
}

/** sharp reads most formats itself; HEIC (HEVC inside HEIF) is decoded to raw pixels first. */
export type ImageDecoder = 'sharp' | 'heic';

export const HEIC_FORMAT: ImageFormat = { ext: 'heic', mime: 'image/heic' };

/** Formats sharp decodes, keyed by what it detects in the file content (not the file name). */
const SHARP_FORMATS: Record<string, ImageFormat> = {
  jpeg: { ext: 'jpg', mime: 'image/jpeg' },
  png: { ext: 'png', mime: 'image/png' },
  webp: { ext: 'webp', mime: 'image/webp' },
  gif: { ext: 'gif', mime: 'image/gif' },
  tiff: { ext: 'tiff', mime: 'image/tiff' },
  heif: { ext: 'avif', mime: 'image/avif' },
};

export interface ProcessedImage {
  /** Display size (orientation applied). */
  width: number;
  height: number;
  placeholder: string;
}

/** A decoded picture and a way to start a fresh sharp pipeline from it. */
interface Source {
  width: number;
  height: number;
  pipeline: () => Sharp;
}

interface HeicImage {
  width: number;
  height: number;
  /** RGBA pixels. */
  data: Uint8ClampedArray;
}
type HeicDecode = (input: { buffer: Uint8Array }) => Promise<HeicImage>;

let heicDecode: HeicDecode | null = null;

/** Loaded on first use: the decoder is a large WebAssembly build of libheif. */
function heicDecoder(): HeicDecode {
  if (!heicDecode) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      heicDecode = require('heic-decode') as HeicDecode;
    } catch {
      throw new HttpError(415, t('errors.media.heicMissing'));
    }
  }
  return heicDecode;
}

/**
 * Tells which image this is by reading its header. Returns null for anything sharp cannot read
 * (videos, documents…). HEIF files that hold HEVC (HEIC) are routed to the HEIC decoder.
 */
export async function identifyImage(
  file: string,
): Promise<{ decoder: ImageDecoder; format: ImageFormat } | null> {
  let meta: Metadata;
  try {
    meta = await sharp(file, SHARP_OPTIONS).metadata();
  } catch {
    return null;
  }
  if (meta.format === 'heif' && meta.compression === 'hevc') return { decoder: 'heic', format: HEIC_FORMAT };
  const format = meta.format ? SHARP_FORMATS[meta.format] : undefined;
  return format && meta.width && meta.height ? { decoder: 'sharp', format } : null;
}

async function openWithSharp(file: string): Promise<Source> {
  let meta: Metadata;
  try {
    meta = await sharp(file, SHARP_OPTIONS).metadata();
  } catch {
    throw new HttpError(415, UNSUPPORTED_FILE);
  }
  if (!meta.width || !meta.height) throw new HttpError(415, UNSUPPORTED_FILE);
  const rotated = (meta.orientation ?? 1) >= 5;
  return {
    width: rotated ? meta.height : meta.width,
    height: rotated ? meta.width : meta.height,
    pipeline: () => sharp(file, SHARP_OPTIONS).rotate(),
  };
}

/** libheif already applies the HEIF rotation/mirroring, so the pixels come out upright. */
async function openHeic(file: string): Promise<Source> {
  const decode = heicDecoder();
  let image: HeicImage;
  try {
    image = await decode({ buffer: await fs.readFile(file) });
  } catch {
    throw new HttpError(422, t('errors.media.heicUnreadable'));
  }
  const { width, height, data } = image;
  if (!width || !height || width * height > MAX_PIXELS || data.byteLength !== width * height * 4)
    throw new HttpError(422, t('errors.media.heicUnreadable'));
  const pixels = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
  return {
    width,
    height,
    pipeline: () => sharp(pixels, { ...SHARP_OPTIONS, raw: { width, height, channels: 4 } }),
  };
}

/**
 * Writes thumb/medium/large WebP files into `targetDir` and returns the display size and a tiny
 * placeholder. Orientation is applied and all metadata (GPS included) is stripped from the outputs.
 */
export async function processImage(
  file: string,
  decoder: ImageDecoder,
  targetDir: string,
): Promise<ProcessedImage> {
  const source = decoder === 'heic' ? await openHeic(file) : await openWithSharp(file);
  try {
    await Promise.all(
      VARIANT_NAMES.map((name) =>
        source
          .pipeline()
          .resize({ width: VARIANTS[name].width, withoutEnlargement: true })
          .webp({ quality: VARIANTS[name].quality, effort: 4 })
          .toFile(path.join(targetDir, name + '.webp')),
      ),
    );
    const tiny = await source.pipeline().resize({ width: 24 }).webp({ quality: 40 }).toBuffer();
    return {
      width: source.width,
      height: source.height,
      placeholder: 'data:image/webp;base64,' + tiny.toString('base64'),
    };
  } catch {
    throw new HttpError(422, t('errors.media.imageFailed'));
  }
}

/** Reads the capture date from EXIF. exifr only reads the parts of the file it needs. */
export async function readTakenAt(file: string): Promise<Date | null> {
  try {
    const tags = await parseExif(file, ['DateTimeOriginal', 'CreateDate']);
    const value = tags?.DateTimeOriginal ?? tags?.CreateDate;
    return value instanceof Date ? value : null;
  } catch {
    return null;
  }
}

function plausible(date: Date | null): date is Date {
  return (
    !!date &&
    !Number.isNaN(date.getTime()) &&
    date.getFullYear() >= 1990 &&
    date.getTime() <= Date.now() + 86_400_000
  );
}

/** Embedded date first, then the file's last-modified time sent by the browser, then now. */
export function pickTakenAt(embedded: Date | null, hint: Date | null): Date {
  return [embedded, hint].find(plausible) ?? new Date();
}
