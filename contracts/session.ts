/** Who is looking at the site. */
export type Role = 'guest' | 'friend' | 'admin' | 'superadmin';

/** Roles that sign in with a username and password. */
export type StaffRole = 'admin' | 'superadmin';

export interface SessionDto {
  role: Role;
  /** Username of the signed-in staff member, null for guests and friends. */
  username: string | null;
  /** True when the visitor may see the private (friends) side of the archive. */
  privateAccess: boolean;
}
