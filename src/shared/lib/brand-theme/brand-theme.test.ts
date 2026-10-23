import assert from 'node:assert/strict';
import { test } from 'node:test';
import { contrastRatio, isHexColor } from '../color';
import { NO_BRAND_COLORS } from '@contracts/branding';
import { brandThemeCss, brandThemeVars } from './index';

/** Navy, signal red, yellow, mid grey, mint: brand colours that stress the generator in different ways. */
const BRANDS = ['#0b1f3a', '#e4002b', '#ffd400', '#808080', '#7be0c3', '#2f5bd0'];

test('changes nothing when the organisation kept the built-in colours', () => {
  assert.deepEqual(brandThemeVars(NO_BRAND_COLORS, 'light'), {});
  assert.equal(brandThemeCss(NO_BRAND_COLORS), '');
});

test('ignores values that are not hex colours', () => {
  assert.equal(brandThemeCss({ primary: 'red;} body{display:none', secondary: null }), '');
});

test('keeps the exact brand colour on buttons in the light theme', () => {
  for (const primary of BRANDS) {
    assert.equal(brandThemeVars({ primary, secondary: null }, 'light')['--primary'], primary);
  }
});

test('lifts dark brand colours in the dark theme', () => {
  const vars = brandThemeVars({ primary: '#0b1f3a', secondary: null }, 'dark');
  assert.ok(contrastRatio(vars['--primary'], '#15181c') >= 4.5);
});

test('keeps links, button labels and badges readable for any brand colour', () => {
  for (const color of BRANDS) {
    for (const mode of ['light', 'dark'] as const) {
      const vars = brandThemeVars({ primary: color, secondary: color }, mode);
      const where = color + ' ' + mode;
      assert.ok(contrastRatio(vars['--link'], vars['--primary-soft']) >= 4.5, 'link on soft, ' + where);
      assert.ok(contrastRatio(vars['--on-primary'], vars['--primary']) >= 4.5, 'label on fill, ' + where);
      assert.ok(
        contrastRatio(vars['--secondary-strong'], vars['--secondary-soft']) >= 4.5,
        'badge text, ' + where,
      );
      for (const value of Object.values(vars)) assert.ok(isHexColor(value), value);
    }
  }
});

test('writes one rule per theme', () => {
  const css = brandThemeCss({ primary: '#e4002b', secondary: null });
  assert.match(css, /^html:root\{--primary:#e4002b;.*\}html\.dark\{--primary:#[0-9a-f]{6};.*\}$/);
  assert.ok(!css.includes('--secondary'));
});
