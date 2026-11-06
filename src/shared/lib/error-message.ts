import { t } from '@i18n';

/** The message of a thrown error, or `fallback` when something that is not an Error was thrown. */
export function messageOf(caught: unknown, fallback = t('common.errors.generic')): string {
  return caught instanceof Error && caught.message ? caught.message : fallback;
}
