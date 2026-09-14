import type { Role, SessionDto } from '@contracts/session';

/** The person behind a request, resolved from the session cookie. */
export interface Viewer {
  role: Role;
  /** Staff user id; null for guests and friends. */
  userId: string | null;
  username: string | null;
  privateAccess: boolean;
}

export const GUEST: Viewer = { role: 'guest', userId: null, username: null, privateAccess: false };
export const FRIEND: Viewer = { role: 'friend', userId: null, username: null, privateAccess: true };

/** Full access for command-line scripts that run outside a request. */
export const SYSTEM: Viewer = { role: 'superadmin', userId: null, username: 'system', privateAccess: true };

export function toSessionDto(viewer: Viewer): SessionDto {
  return { role: viewer.role, username: viewer.username, privateAccess: viewer.privateAccess };
}
