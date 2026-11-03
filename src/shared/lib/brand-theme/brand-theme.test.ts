import assert from 'node:assert/strict';
import { test } from 'node:test';
import { contrastRatio, isHexColor } from '../color';
import { NO_BRAND_COLORS } from '@contracts/branding';
import { brandThemeCss, brandThemeVars, describePrimary } from './index';

/** Navy, signal red, yellow, mid grey, mint: brand colours that stress the generator in different ways. */
const BRANDS = ['#0b1f3a', '#e4002b', '#ffd400', '#808080', '#7be0c3', '#2f5bd0', '#000000', '#ffffff'];

test('changes nothing when the organisation kept the built-in colours', () => {
  assert.deepEqual(brandThemeVars(NO_BRAND_COLORS, 'light'), {});
  assert.equal(brandThemeCss(NO_BRAND_COLORS), '');
});

test('ignores values that are not hex colours', () => {
  assert.equal(brandThemeCss({ primary: 'red;} body{display:none', secondary: null }), '');
});

test('keeps the exact brand colour on buttons where it stands out from the page', () => {
  for (const primary of ['#0b1f3a', '#e4002b', '#808080', '#2f5bd0', '#000000']) {
    assert.equal(brandThemeVars({ primary, secondary: null }, 'light')['--primary'], primary);
  }
  for (const primary of ['#ffd400', '#7be0c3', '#ffffff']) {
    assert.equal(brandThemeVars({ primary, secondary: null }, 'dark')['--primary'], primary);
  }
});

test('moves a colour that would vanish into the page until it can be seen', () => {
  for (const color of BRANDS) {
    const light = brandThemeVars({ primary: color, secondary: color }, 'light');
    const dark = brandThemeVars({ primary: color, secondary: color }, 'dark');
    for (const page of ['#ffffff', '#f5f6f8']) {
      assert.ok(contrastRatio(light['--primary'], page) >= 3, color + ' primary on light ' + page);
      assert.ok(contrastRatio(light['--secondary'], page) >= 3, color + ' secondary on light ' + page);
    }
    for (const page of ['#0d0f12', '#15181c', '#1d2126']) {
      assert.ok(contrastRatio(dark['--primary'], page) >= 3, color + ' primary on dark ' + page);
      assert.ok(contrastRatio(dark['--secondary'], page) >= 3, color + ' secondary on dark ' + page);
    }
  }
});

test('turns black and white into ink: dark on the light page, light on the dark one', () => {
  for (const primary of ['#000000', '#ffffff']) {
    const light = brandThemeVars({ primary, secondary: null }, 'light');
    const dark = brandThemeVars({ primary, secondary: null }, 'dark');
    assert.ok(contrastRatio(light['--primary'], '#ffffff') >= 12, primary + ' light');
    assert.ok(contrastRatio(dark['--primary'], '#15181c') >= 12, primary + ' dark');
    assert.equal(light['--on-primary'], '#ffffff');
    assert.notEqual(dark['--on-primary'], '#ffffff');
  }
});

test('gives the bundled logo one colour for both themes', () => {
  const colors = { primary: '#0b1f3a', secondary: null };
  assert.equal(brandThemeVars(colors, 'light')['--logo'], '#0b1f3a');
  assert.equal(brandThemeVars(colors, 'light')['--on-logo'], '#ffffff');
  assert.equal(brandThemeVars(colors, 'dark')['--logo'], undefined);
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

test('says what it changed about a primary colour', () => {
  assert.deepEqual(describePrimary('#0b1f3a'), {
    darkLabels: false,
    darkerInLight: false,
    lighterInDark: true,
  });
  assert.deepEqual(describePrimary('#ffd400'), {
    darkLabels: true,
    darkerInLight: true,
    lighterInDark: false,
  });
  assert.deepEqual(describePrimary('#2f5bd0'), {
    darkLabels: false,
    darkerInLight: false,
    lighterInDark: true,
  });
});
