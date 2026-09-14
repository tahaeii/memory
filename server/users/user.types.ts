import type { StaffRole } from '@contracts/session';

/** One staff account, as stored in users.json. */
export interface UserRecord {
  id: string;
  /** Lowercase, unique. */
  username: string;
  passwordHash: string;
  role: StaffRole;
  /** May see and manage private items. Ignored for the super admin, who always may. */
  privateAccess: boolean;
  active: boolean;
  /** Bumped to end every open session of this user (password change, block, unblock). */
  sessionVersion: number;
  createdAt: string;
  updatedAt: string;
  /** Null while the user still has a password someone else chose. */
  passwordChangedAt: string | null;
}
