import { promises as fs } from 'node:fs';
import { binaryPathFromEnv } from '@server/config';
import { HttpError } from '@server/lib/errors';
import { fileExists } from '@server/lib/fs';
import { ProcessError, runProcess } from '@server/lib/process';

type Binary = 'ffmpeg' | 'ffprobe';

/** Longest side of the converted video. */
const MAX_SIDE = 1920;

/**
 * Applied to every input. Only real video containers are opened, and only from local files, so a
 * crafted upload (for example a playlist pretending to be a video) can never make ffmpeg read
 * other files on the server or reach the network.
 */
const INPUT_GUARDS = [
  '-protocol_whitelist',
  'file',
  '-format_whitelist',
  'mov,matroska,avi,asf,flv,mpegts,mpeg,ogg',
];

const QUIET = ['-hide_banner', '-nostdin', '-y', '-v', 'error'];

/** Scales down (never up) so the longest side is at most MAX_SIDE, keeping even dimensions for H.264. */
const SCALE = "scale='trunc(iw*min(1,MAX/max(iw,ih))/2)*2':'trunc(ih*min(1,MAX/max(iw,ih))/2)*2'".replaceAll(
  'MAX',
  String(MAX_SIDE),
);

const ENCODE = [
  '-vf',
  SCALE,
  '-c:v',
  'libx264',
  '-preset',
  'veryfast',
  '-crf',
  '23',
  '-profile:v',
  'high',
  '-pix_fmt',
  'yuv420p',
  '-c:a',
  'aac',
  '-b:a',
  '128k',
  '-ac',
  '2',
];

const resolved = new Map<Binary, string>();

/** FFMPEG_PATH / FFPROBE_PATH first, then the binary installed by npm, then whatever is on PATH. */
function binary(name: Binary): string {
  let found = resolved.get(name) ?? binaryPathFromEnv(name);
  if (!found) {
    try {
      /* eslint-disable @typescript-eslint/no-require-imports */
      const installer = (
        name === 'ffmpeg' ? require('@ffmpeg-installer/ffmpeg') : require('@ffprobe-installer/ffprobe')
      ) as { path?: string };
      /* eslint-enable @typescript-eslint/no-require-imports */
      found = installer.path;
    } catch {
      // No package for this platform; fall back to the system binary.
    }
  }
  found ??= name;
  resolved.set(name, found);
  return found;
}

function missingBinary(error: unknown): boolean {
  return error instanceof ProcessError && error.code === 'ENOENT';
}

const NO_FFMPEG = 'Video support is not available: ffmpeg was not found on the server.';

export interface VideoProbe {
  /** Display size (rotation applied). */
  width: number;
  height: number;
  /** Seconds; 0 when unknown. */
  duration: number;
  /** Clockwise rotation stored in the file, 0-359. */
  rotation: number;
  /** Absolute index of the main video stream. */
  streamIndex: number;
  videoCodec: string;
  pixelFormat: string;
  /** Codec of the first audio stream, null when silent. */
  audioCodec: string | null;
  /** ffprobe format name, e.g. "mov,mp4,m4a,3gp,3g2,mj2". */
  container: string;
  /** Recording date written by the camera or phone. */
  recordedAt: Date | null;
}

interface FfprobeStream {
  index: number;
  codec_type?: string;
  codec_name?: string;
  width?: number;
  height?: number;
  pix_fmt?: string;
  duration?: string;
  tags?: Record<string, string>;
  side_data_list?: Array<{ rotation?: number }>;
  disposition?: { attached_pic?: number };
}

interface FfprobeOutput {
  streams?: FfprobeStream[];
  format?: { format_name?: string; duration?: string; tags?: Record<string, string> };
}

function positive(value: string | undefined): number | null {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function readRotation(stream: FfprobeStream): number {
  const fromSideData = stream.side_data_list?.find((item) => typeof item.rotation === 'number')?.rotation;
  const raw = fromSideData ?? Number(stream.tags?.rotate ?? 0);
  return Number.isFinite(raw) ? ((Math.round(raw) % 360) + 360) % 360 : 0;
}

function readDate(tags: Record<string, string> | undefined): Date | null {
  const value = tags?.['com.apple.quicktime.creationdate'] ?? tags?.creation_time;
  if (!value) return null;
  const date = new Date(value.replace(/([+-]\d{2})(\d{2})$/, '$1:$2'));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Reads a file with ffprobe. Returns null when it is not a video ffmpeg can open. */
export async function probeVideo(file: string): Promise<VideoProbe | null> {
  let output: FfprobeOutput;
  try {
    const json = await runProcess(
      binary('ffprobe'),
      [...INPUT_GUARDS, '-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', file],
      { timeoutMs: 60_000, captureStdout: true },
    );
    output = JSON.parse(json) as FfprobeOutput;
  } catch (error) {
    if (missingBinary(error)) throw new HttpError(503, NO_FFMPEG);
    return null;
  }

  const streams = output.streams ?? [];
  const video = streams.find(
    (stream) =>
      stream.codec_type === 'video' && !stream.disposition?.attached_pic && stream.width && stream.height,
  );
  if (!video?.width || !video.height || !video.codec_name) return null;

  const rotation = readRotation(video);
  const sideways = rotation % 180 === 90;
  return {
    width: sideways ? video.height : video.width,
    height: sideways ? video.width : video.height,
    duration: positive(output.format?.duration) ?? positive(video.duration) ?? 0,
    rotation,
    streamIndex: video.index,
    videoCodec: video.codec_name,
    pixelFormat: video.pix_fmt ?? '',
    audioCodec: streams.find((stream) => stream.codec_type === 'audio')?.codec_name ?? null,
    container: output.format?.format_name ?? '',
    recordedAt: readDate(output.format?.tags) ?? readDate(video.tags),
  };
}

/**
 * Saves one upright frame as PNG: one second in (or the middle of a short clip), else the first frame.
 * Seeking past the end makes ffmpeg exit cleanly without writing anything, hence the fallback.
 */
export async function extractPoster(file: string, probe: VideoProbe, output: string): Promise<void> {
  const at = probe.duration > 0 ? Math.min(1, probe.duration / 2) : 0;
  for (const seek of at > 0 ? [at, 0] : [0]) {
    try {
      await runProcess(
        binary('ffmpeg'),
        [
          ...QUIET,
          ...(seek > 0 ? ['-ss', seek.toFixed(3)] : []),
          ...INPUT_GUARDS,
          '-i',
          file,
          '-map',
          '0:' + probe.streamIndex,
          '-frames:v',
          '1',
          '-an',
          '-sn',
          '-dn',
          '-update',
          '1',
          '-f',
          'image2',
          '-c:v',
          'png',
          output,
        ],
        { timeoutMs: 120_000 },
      );
    } catch (error) {
      if (missingBinary(error)) throw new HttpError(503, NO_FFMPEG);
      continue;
    }
    if (await fileExists(output)) return;
  }
  throw new HttpError(422, 'Could not read a frame from this video. The file may be damaged.');
}

/**
 * H.264 + AAC up to MAX_SIDE without rotation plays everywhere, so it is only re-packaged (seconds).
 * Everything else (HEVC from iPhones, VP9, WMV, AVI…) is re-encoded.
 */
export function canCopyStreams(probe: VideoProbe): boolean {
  return (
    probe.videoCodec === 'h264' &&
    (probe.pixelFormat === 'yuv420p' || probe.pixelFormat === 'yuvj420p') &&
    (probe.audioCodec === null || probe.audioCodec === 'aac') &&
    probe.rotation === 0 &&
    Math.max(probe.width, probe.height) <= MAX_SIDE &&
    /(^|,)(mov|mp4|matroska)(,|$)/.test(probe.container)
  );
}

function parseClock(value: string): number | null {
  const match = /^(\d+):(\d{2}):(\d{2}(?:\.\d+)?)$/.exec(value);
  return match ? Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]) : null;
}

export interface ConvertOptions {
  signal: AbortSignal;
  onProgress: (ratio: number) => void;
}

/**
 * Writes a browser-friendly MP4 (H.264/AAC, "fast start" so playback begins before the download ends).
 * All metadata, including the location phones record, is dropped.
 */
export async function convertVideo(
  input: string,
  output: string,
  probe: VideoProbe,
  options: ConvertOptions,
): Promise<void> {
  try {
    await runProcess(
      binary('ffmpeg'),
      [
        ...QUIET,
        ...INPUT_GUARDS,
        '-i',
        input,
        '-map',
        '0:' + probe.streamIndex,
        '-map',
        '0:a:0?',
        '-sn',
        '-dn',
        '-map_metadata',
        '-1',
        ...(canCopyStreams(probe) ? ['-c', 'copy'] : ENCODE),
        '-movflags',
        '+faststart',
        '-max_muxing_queue_size',
        '1024',
        '-progress',
        'pipe:1',
        '-nostats',
        '-f',
        'mp4',
        output,
      ],
      {
        timeoutMs: Math.max(60 * 60_000, probe.duration * 20_000),
        signal: options.signal,
        onLine: (line) => {
          if (!line.startsWith('out_time=') || probe.duration <= 0) return;
          const seconds = parseClock(line.slice('out_time='.length));
          if (seconds !== null) options.onProgress(Math.min(0.99, Math.max(0, seconds / probe.duration)));
        },
      },
    );
  } catch (error) {
    await fs.rm(output, { force: true });
    if (missingBinary(error)) throw new HttpError(503, NO_FFMPEG);
    throw error;
  }
}

/** Warns at startup when ffmpeg or ffprobe is missing, instead of at the first video upload. */
export async function checkVideoTools(): Promise<void> {
  for (const name of ['ffprobe', 'ffmpeg'] as const) {
    try {
      await runProcess(binary(name), ['-version'], { timeoutMs: 15_000 });
    } catch {
      console.warn('[video] ' + name + ' is not available (' + binary(name) + '). Video uploads will fail.');
    }
  }
}
