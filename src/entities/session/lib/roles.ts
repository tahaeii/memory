import type { Role } from '@contracts/session';

/** Admins and the super admin. */
export const isStaffRole = (role: Role): boolean => role === 'admin' || role === 'superadmin';

export const roleLabel: Record<Role, string> = {
  guest: 'Guest',
  friend: 'Friend',
  admin: 'Admin',
  superadmin: 'Super admin',
};
