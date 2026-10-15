import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { LibrarySummaryDto } from '@/entities/media';
import { describeArchive } from './describe-archive';

const summary = (patch: Partial<LibrarySummaryDto>): LibrarySummaryDto => ({
  itemCount: 0,
  photoCount: 0,
  videoCount: 0,
  publicCount: 0,
  privateCount: 0,
  years: [],
  totalBytes: 0,
  deletedCount: 0,
  ...patch,
});

test('says nothing about an empty archive', () => {
  assert.equal(describeArchive(summary({}), 3), '');
});

test('counts photos, videos and events and names the first year', () => {
  const full = summary({ itemCount: 1216, photoCount: 1204, videoCount: 12, years: [2026, 2023, 2019] });
  assert.equal(describeArchive(full, 8), '1,204 photos and 12 videos from 8 events, since 2019');
});

test('uses the singular and leaves out what is missing', () => {
  assert.equal(
    describeArchive(summary({ itemCount: 1, photoCount: 1, years: [2026] }), 0),
    '1 photo, since 2026',
  );
  assert.equal(describeArchive(summary({ itemCount: 2, videoCount: 2 }), 1), '2 videos from 1 event');
});
