import assert from 'node:assert/strict';
import { test } from 'node:test';
import { contrastRatio, hexToOklch, isHexColor, oklchToHex, readableOn } from './index';

test('accepts only six-digit hex colours', () => {
  assert.equal(isHexColor('#2f5bd0'), true);
  assert.equal(isHexColor('#2F5BD0'), true);
  assert.equal(isHexColor('#fff'), false);
  assert.equal(isHexColor('2f5bd0'), false);
  assert.equal(isHexColor('#2f5bd0; color: red'), false);
  assert.equal(isHexColor(null), false);
});

test('converts hex to OKLCH and back without drifting', () => {
  for (const hex of ['#000000', '#ffffff', '#2f5bd0', '#e4002b', '#ffd400', '#0e8a83', '#808080']) {
    assert.equal(oklchToHex(hexToOklch(hex)), hex);
  }
});

test('reads lightness the way people see it', () => {
  assert.ok(Math.abs(hexToOklch('#ffffff').l - 1) < 1e-3);
  assert.ok(hexToOklch('#000000').l < 1e-3);
  assert.ok(hexToOklch('#ffd400').l > hexToOklch('#2f5bd0').l);
  assert.ok(hexToOklch('#808080').c < 1e-3);
});

test('pulls colours outside sRGB back in by lowering chroma only', () => {
  const vivid = { l: 0.7, c: 0.4, h: 150 };
  const mapped = hexToOklch(oklchToHex(vivid));
  assert.ok(mapped.c < vivid.c);
  assert.ok(Math.abs(mapped.l - vivid.l) < 0.02);
  assert.ok(Math.abs(mapped.h - vivid.h) < 3);
});

test('measures WCAG contrast', () => {
  assert.equal(Math.round(contrastRatio('#000000', '#ffffff')), 21);
  assert.equal(contrastRatio('#2f5bd0', '#2f5bd0'), 1);
  assert.equal(contrastRatio('#123456', '#fedcba'), contrastRatio('#fedcba', '#123456'));
});

test('picks readable text for a background', () => {
  assert.equal(readableOn('#0b1f3a'), '#ffffff');
  assert.equal(readableOn('#ffd400'), '#14171c');
  assert.equal(readableOn('#2f5bd0'), '#ffffff');
});
