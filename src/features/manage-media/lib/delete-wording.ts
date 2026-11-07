import { t } from '@i18n';
import type { Role } from '@/entities/session';

/**
 * What the delete confirmation says. The super admin's delete is final; an admin is told the items
 * are deleted (they disappear for everyone), while they actually wait for the super admin's review.
 */
export function deleteWording(role: Role, count: number, noun: 'item' | 'photo' | 'video' = 'item') {
  if (role === 'superadmin')
    return {
      title:
        count === 1
          ? t(`media.delete.titleOneForGood.${noun}`)
          : t('media.delete.titleManyForGood', { count }),
      body: t('media.delete.bodyForGood'),
      confirm: t('media.delete.confirmForGood'),
    };
  return {
    title: count === 1 ? t(`media.delete.titleOne.${noun}`) : t('media.delete.titleMany', { count }),
    body: t('media.delete.body'),
    confirm: t('media.delete.confirm'),
  };
}
