import admin from './en/admin.json';
import auth from './en/auth.json';
import branding from './en/branding.json';
import common from './en/common.json';
import errors from './en/errors.json';
import events from './en/events.json';
import gallery from './en/gallery.json';
import home from './en/home.json';
import media from './en/media.json';
import settings from './en/settings.json';
import setup from './en/setup.json';
import ui from './en/ui.json';
import upload from './en/upload.json';
import users from './en/users.json';
import validation from './en/validation.json';
import viewer from './en/viewer.json';

/**
 * Every text a person can read, by area. Components and API routes never contain a sentence: they
 * ask for one by key, e.g. `t('gallery.title')`. The files in ./en are the only place to edit wording.
 */
export const messages = {
  admin,
  auth,
  branding,
  common,
  errors,
  events,
  gallery,
  home,
  media,
  settings,
  setup,
  ui,
  upload,
  users,
  validation,
  viewer,
};

/** A count-dependent text: `{ "one": "{count} photo", "other": "{count} photos" }`. */
interface PluralForms {
  other: string;
}

type Join<P extends string, K extends string> = P extends '' ? K : `${P}.${K}`;

/** Dotted paths of all plain texts, e.g. `'gallery.title'`. */
type TextPaths<T, P extends string = ''> = T extends string
  ? P
  : T extends PluralForms
    ? never
    : { [K in keyof T & string]: TextPaths<T[K], Join<P, K>> }[keyof T & string];

/** Dotted paths of all count-dependent texts. */
type PluralPaths<T, P extends string = ''> = T extends string
  ? never
  : T extends PluralForms
    ? P
    : { [K in keyof T & string]: PluralPaths<T[K], Join<P, K>> }[keyof T & string];

export type MessageKey = TextPaths<typeof messages>;
export type PluralKey = PluralPaths<typeof messages>;
export type MessageValues = Record<string, string | number>;

const pluralRules = new Intl.PluralRules('en');
const numbers = new Intl.NumberFormat('en');

function lookup(key: string): unknown {
  let node: unknown = messages;
  for (const part of key.split('.')) node = (node as Record<string, unknown> | undefined)?.[part];
  return node;
}

function fill(template: string, values?: MessageValues): string {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
    name in values ? String(values[name]) : placeholder,
  );
}

/** The text for `key`, with `{placeholders}` replaced by `values`. */
export function t(key: MessageKey, values?: MessageValues): string {
  return fill(lookup(key) as string, values);
}

/** The form of `key` that fits `count` ("1 photo", "2 photos"). `{count}` is filled in, with digit grouping. */
export function plural(key: PluralKey, count: number, values?: MessageValues): string {
  const forms = lookup(key) as Record<string, string>;
  return fill(forms[pluralRules.select(count)] ?? forms.other, { count: numbers.format(count), ...values });
}
