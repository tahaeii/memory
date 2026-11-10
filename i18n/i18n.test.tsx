import assert from 'node:assert/strict';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { messages, plural, t } from './index';
import { rich } from './rich';

test('returns the text for a key', () => {
  assert.equal(t('common.actions.cancel'), 'Cancel');
});

test('fills in placeholders and leaves unknown ones alone', () => {
  assert.equal(t('validation.password.min', { min: 8 }), 'Use at least 8 characters.');
  assert.equal(t('validation.password.min'), 'Use at least {min} characters.');
});

test('chooses the form that fits the count and groups digits', () => {
  assert.equal(plural('common.media.photos', 1), '1 photo');
  assert.equal(plural('common.media.photos', 0), '0 photos');
  assert.equal(plural('common.media.photos', 1204), '1,204 photos');
});

test('renders the marked parts of a text', () => {
  const html = renderToStaticMarkup(
    <>{rich('admin.signedInAs', { b: (text) => <b>{text}</b> }, { username: 'sara', role: 'admin' })}</>,
  );
  assert.equal(html, 'Signed in as <b>sara</b>, admin.');
});

test('every count-dependent text has the "one" and "other" forms English needs', () => {
  const check = (node: unknown, path: string): void => {
    if (typeof node !== 'object' || node === null) return;
    const forms = node as Record<string, unknown>;
    if (typeof forms.other === 'string') assert.equal(typeof forms.one, 'string', path);
    else for (const [key, value] of Object.entries(forms)) check(value, path + '.' + key);
  };
  check(messages, 'messages');
});
