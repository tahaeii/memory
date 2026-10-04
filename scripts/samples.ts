import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import type { Visibility } from '@contracts/media';
import { SYSTEM } from '@server/auth/viewer';
import { createEvent, deleteEvent, listEvents } from '@server/events/event.service';
import { ensureDir } from '@server/lib/fs';
import { mediaRepository } from '@server/media/media.repository';
import { ingestMedia, removeMedia } from '@server/media/media.service';
import { tmpRoot } from '@server/storage/paths';

/**
 * Adds ~20 generated sample photos (3 events, some private) so the gallery is not empty.
 *   npx tsx scripts/samples.ts            add samples (skips if they already exist)
 *   npx tsx scripts/samples.ts --remove   delete every sample photo and sample event
 * Stop the dev/production server first, or restart it afterwards: it caches the library in memory.
 */
const PHOTO_PREFIX = 'sample-';
const EVENT_PREFIX = 'Sample: ';

type Kind = 'hills' | 'mountain' | 'dunes' | 'city';
interface Palette {
  sky: [string, string, string];
  ground: [string, string, string];
}

const PALETTES: Record<string, Palette> = {
  sunrise: { sky: ['#fde68a', '#fdba74', '#fb7185'], ground: ['#f59e0b', '#c2410c', '#7c2d12'] },
  royal: { sky: ['#dbe4ff', '#9db4f1', '#4169e1'], ground: ['#3553b8', '#263fa0', '#172144'] },
  lagoon: { sky: ['#ccfbf1', '#5eead4', '#0d9488'], ground: ['#0f766e', '#115e59', '#134e4a'] },
  dusk: { sky: ['#fbcfe8', '#c4b5fd', '#6366f1'], ground: ['#4f46e5', '#3730a3', '#1e1b4b'] },
  forest: { sky: ['#ecfccb', '#bef264', '#65a30d'], ground: ['#4d7c0f', '#3f6212', '#1a2e05'] },
  mono: { sky: ['#cbd5e1', '#64748b', '#1e293b'], ground: ['#334155', '#1e293b', '#0f172a'] },
};

const KINDS = {
  hills: { amp: 0.08, freq: 2, jagged: false },
  dunes: { amp: 0.12, freq: 1.4, jagged: false },
  mountain: { amp: 0.2, freq: 3, jagged: true },
};

const EVENTS = [
  {
    title: EVENT_PREFIX + 'Nowruz Celebration',
    date: '2026-03-21',
    description: 'Haft-sin table, family lunch and the first day of spring at the office.',
  },
  {
    title: EVENT_PREFIX + 'Summer Team Retreat',
    date: '2026-07-12',
    description: 'Two days by the coast: workshops, hikes and a very competitive volleyball match.',
  },
  {
    title: EVENT_PREFIX + 'Product Launch Night',
    date: '2025-11-05',
    description: 'The evening we shipped version 2.0 and celebrated with the whole team.',
  },
];

interface Spec {
  name: string;
  palette: string;
  kind: Kind;
  size: [number, number];
  at: string;
  event: number | null;
  visibility: Visibility;
}

const L: [number, number] = [2400, 1600];
const P: [number, number] = [1600, 2000];
const S: [number, number] = [1800, 1800];
const W: [number, number] = [2400, 1200];

const SPECS: Spec[] = [
  {
    name: 'nowruz-sunrise',
    palette: 'sunrise',
    kind: 'dunes',
    size: L,
    at: '2026-03-21T07:40:00Z',
    event: 0,
    visibility: 'public',
  },
  {
    name: 'nowruz-garden',
    palette: 'forest',
    kind: 'hills',
    size: P,
    at: '2026-03-21T09:10:00Z',
    event: 0,
    visibility: 'public',
  },
  {
    name: 'nowruz-table',
    palette: 'lagoon',
    kind: 'hills',
    size: L,
    at: '2026-03-21T12:30:00Z',
    event: 0,
    visibility: 'public',
  },
  {
    name: 'nowruz-skyline',
    palette: 'royal',
    kind: 'city',
    size: W,
    at: '2026-03-21T17:05:00Z',
    event: 0,
    visibility: 'public',
  },
  {
    name: 'nowruz-backstage',
    palette: 'dusk',
    kind: 'mountain',
    size: S,
    at: '2026-03-21T18:20:00Z',
    event: 0,
    visibility: 'private',
  },
  {
    name: 'nowruz-toast',
    palette: 'sunrise',
    kind: 'hills',
    size: P,
    at: '2026-03-21T19:45:00Z',
    event: 0,
    visibility: 'private',
  },
  {
    name: 'retreat-arrival',
    palette: 'lagoon',
    kind: 'dunes',
    size: L,
    at: '2026-07-12T10:00:00Z',
    event: 1,
    visibility: 'public',
  },
  {
    name: 'retreat-hike',
    palette: 'forest',
    kind: 'mountain',
    size: L,
    at: '2026-07-12T14:15:00Z',
    event: 1,
    visibility: 'public',
  },
  {
    name: 'retreat-workshop',
    palette: 'royal',
    kind: 'hills',
    size: L,
    at: '2026-07-12T16:30:00Z',
    event: 1,
    visibility: 'public',
  },
  {
    name: 'retreat-sunset',
    palette: 'sunrise',
    kind: 'mountain',
    size: W,
    at: '2026-07-12T19:50:00Z',
    event: 1,
    visibility: 'public',
  },
  {
    name: 'retreat-volleyball',
    palette: 'mono',
    kind: 'dunes',
    size: P,
    at: '2026-07-13T09:30:00Z',
    event: 1,
    visibility: 'public',
  },
  {
    name: 'retreat-bonfire',
    palette: 'dusk',
    kind: 'hills',
    size: S,
    at: '2026-07-13T21:10:00Z',
    event: 1,
    visibility: 'private',
  },
  {
    name: 'retreat-bloopers',
    palette: 'sunrise',
    kind: 'city',
    size: L,
    at: '2026-07-13T22:00:00Z',
    event: 1,
    visibility: 'private',
  },
  {
    name: 'launch-stage',
    palette: 'royal',
    kind: 'city',
    size: L,
    at: '2025-11-05T18:30:00Z',
    event: 2,
    visibility: 'public',
  },
  {
    name: 'launch-team',
    palette: 'mono',
    kind: 'hills',
    size: L,
    at: '2025-11-05T19:15:00Z',
    event: 2,
    visibility: 'public',
  },
  {
    name: 'launch-demo',
    palette: 'dusk',
    kind: 'mountain',
    size: P,
    at: '2025-11-05T20:00:00Z',
    event: 2,
    visibility: 'public',
  },
  {
    name: 'launch-afterparty',
    palette: 'lagoon',
    kind: 'city',
    size: W,
    at: '2025-11-05T22:40:00Z',
    event: 2,
    visibility: 'private',
  },
  {
    name: 'office-morning',
    palette: 'sunrise',
    kind: 'hills',
    size: L,
    at: '2026-09-02T08:20:00Z',
    event: null,
    visibility: 'public',
  },
  {
    name: 'office-lunch',
    palette: 'forest',
    kind: 'dunes',
    size: S,
    at: '2026-09-10T12:45:00Z',
    event: null,
    visibility: 'public',
  },
  {
    name: 'office-friday',
    palette: 'royal',
    kind: 'mountain',
    size: L,
    at: '2026-09-18T16:00:00Z',
    event: null,
    visibility: 'private',
  },
];

/** Small deterministic random generator so every run draws the same pictures. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ridge(
  w: number,
  h: number,
  base: number,
  amp: number,
  freq: number,
  jagged: boolean,
  rand: () => number,
): string {
  const steps = 48;
  const p1 = rand() * Math.PI * 2;
  const p2 = rand() * Math.PI * 2;
  const points: string[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = (i / steps) * Math.PI * freq;
    let wave = Math.sin(t + p1) * 0.6 + Math.sin(t * 2.3 + p2) * 0.4;
    if (jagged) wave = Math.abs(wave) * 1.6 - 0.6 + (rand() - 0.5) * 0.25;
    points.push(((w / steps) * i).toFixed(1) + ',' + (base - wave * amp * h).toFixed(1));
  }
  return 'M0,' + h + ' L' + points.join(' L') + ' L' + w + ',' + h + ' Z';
}

function skyline(w: number, h: number, base: number, color: string, rand: () => number): string {
  const rects: string[] = [];
  for (let x = 0; x < w;) {
    const bw = w * (0.03 + rand() * 0.05);
    const bh = h * (0.08 + rand() * 0.28);
    rects.push(
      '<rect x="' +
        x.toFixed(1) +
        '" y="' +
        (base - bh).toFixed(1) +
        '" width="' +
        (bw - 3).toFixed(1) +
        '" height="' +
        (bh + h).toFixed(1) +
        '" fill="' +
        color +
        '"/>',
    );
    x += bw;
  }
  return rects.join('');
}

function scene(spec: Spec, seed: number): string {
  const [w, h] = spec.size;
  const palette = PALETTES[spec.palette];
  const rand = mulberry32(seed);
  const sunX = w * (0.25 + rand() * 0.5);
  const sunY = h * (0.26 + rand() * 0.14);
  const radius = Math.min(w, h) * 0.09;
  const layers = [0.62, 0.72, 0.84]
    .map((base, i) => {
      if (spec.kind === 'city') return skyline(w, h, h * base, palette.ground[i], rand);
      const k = KINDS[spec.kind];
      return (
        '<path d="' +
        ridge(w, h, h * base, k.amp, k.freq + i * 0.6, k.jagged, rand) +
        '" fill="' +
        palette.ground[i] +
        '"/>'
      );
    })
    .join('');
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" width="' +
    w +
    '" height="' +
    h +
    '" viewBox="0 0 ' +
    w +
    ' ' +
    h +
    '">' +
    '<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="' +
    palette.sky[0] +
    '"/><stop offset="0.6" stop-color="' +
    palette.sky[1] +
    '"/>' +
    '<stop offset="1" stop-color="' +
    palette.sky[2] +
    '"/></linearGradient>' +
    '<radialGradient id="glow"><stop offset="0" stop-color="#fff" stop-opacity="0.9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>' +
    '<rect width="' +
    w +
    '" height="' +
    h +
    '" fill="url(#sky)"/>' +
    '<circle cx="' +
    sunX.toFixed(1) +
    '" cy="' +
    sunY.toFixed(1) +
    '" r="' +
    (radius * 3.2).toFixed(1) +
    '" fill="url(#glow)"/>' +
    '<circle cx="' +
    sunX.toFixed(1) +
    '" cy="' +
    sunY.toFixed(1) +
    '" r="' +
    radius.toFixed(1) +
    '" fill="#fff" opacity="0.92"/>' +
    layers +
    '</svg>'
  );
}

async function removeSamples(): Promise<void> {
  const photos = (await mediaRepository.all()).filter((photo) => photo.name.startsWith(PHOTO_PREFIX));
  await removeMedia(
    photos.map((photo) => photo.id),
    SYSTEM,
  );
  const events = (await listEvents(SYSTEM)).filter((event) => event.title.startsWith(EVENT_PREFIX));
  for (const event of events) await deleteEvent(event.id);
  console.log('Removed ' + photos.length + ' sample photos and ' + events.length + ' sample events.');
}

async function addSamples(): Promise<void> {
  const existing = (await mediaRepository.all()).some((photo) => photo.name.startsWith(PHOTO_PREFIX));
  if (existing && !process.argv.includes('--force')) {
    console.log('Sample photos already exist. Remove them first (--remove), or add --force.');
    return;
  }
  await ensureDir(tmpRoot());
  const events: Awaited<ReturnType<typeof createEvent>>[] = [];
  for (const input of EVENTS) events.push(await createEvent(input, SYSTEM));

  let count = 0;
  for (const [index, spec] of SPECS.entries()) {
    const jpeg = await sharp(Buffer.from(scene(spec, 1000 + index * 37)))
      .jpeg({ quality: 88 })
      .toBuffer();
    const tmpPath = path.join(tmpRoot(), 'sample-' + index + '.upload');
    await fs.writeFile(tmpPath, jpeg);
    await ingestMedia(
      {
        tmpPath,
        name: PHOTO_PREFIX + spec.name + '.jpg',
        visibility: spec.visibility,
        eventId: spec.event === null ? null : events[spec.event].id,
        takenAtHint: new Date(spec.at),
      },
      SYSTEM,
    );
    count += 1;
    process.stdout.write('\r  sample photos: ' + count + '/' + SPECS.length);
  }
  console.log('\nDone. Restart the server if it is already running.');
}

(process.argv.includes('--remove') ? removeSamples() : addSamples()).catch((error) => {
  console.error(error);
  process.exit(1);
});
