import { promises as fs } from 'node:fs';
import { HEIC_FORMAT, identifyImage, type ImageDecoder, type ImageFormat } from './image.processor';
import { probeVideo, type VideoProbe } from './video.processor';

export type DetectedMedia =
  { kind: 'photo'; decoder: ImageDecoder; format: ImageFormat } | { kind: 'video'; probe: VideoProbe };

const HEIC_BRANDS = new Set(['heic', 'heix', 'heim', 'heis', 'hevc', 'hevx', 'hevm', 'hevs']);
const AVIF_BRANDS = new Set(['avif', 'avis']);

/** Brands of the ISO-BMFF "ftyp" box that HEIC, AVIF, MP4 and MOV files start with. */
async function readBrands(file: string): Promise<string[]> {
  const handle = await fs.open(file, 'r');
  try {
    const header = Buffer.alloc(256);
    const { bytesRead } = await handle.read(header, 0, header.length, 0);
    if (bytesRead < 16 || header.toString('latin1', 4, 8) !== 'ftyp') return [];
    const end = Math.min(header.readUInt32BE(0), bytesRead);
    const brands = [header.toString('latin1', 8, 12)];
    for (let offset = 16; offset + 4 <= end; offset += 4)
      brands.push(header.toString('latin1', offset, offset + 4));
    return brands;
  } finally {
    await handle.close();
  }
}

/**
 * Works out what an upload is from its content, never from its name:
 * HEIC by its brand, other images by sharp, and finally videos by ffprobe.
 */
export async function detectMedia(file: string): Promise<DetectedMedia | null> {
  const brands = await readBrands(file);
  const isAvif = brands.some((brand) => AVIF_BRANDS.has(brand));
  if (!isAvif && brands.some((brand) => HEIC_BRANDS.has(brand))) {
    return { kind: 'photo', decoder: 'heic', format: HEIC_FORMAT };
  }
  const image = await identifyImage(file);
  if (image) return { kind: 'photo', ...image };
  const probe = await probeVideo(file);
  return probe ? { kind: 'video', probe } : null;
}
