import { t } from '@i18n';
import type { Role } from '@contracts/session';

/** Admins and the super admin. */
export const isStaffRole = (role: Role): boolean => role === 'admin' || role === 'superadmin';

export const roleLabel: Record<Role, string> = {
  guest: t('users.roles.guest'),
  friend: t('users.roles.friend'),
  admin: t('users.roles.admin'),
  superadmin: t('users.roles.superadmin'),
};
