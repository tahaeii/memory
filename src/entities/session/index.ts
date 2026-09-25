export type { Role, SessionDto, StaffRole } from '@contracts/session';
export { isStaffRole, roleLabel } from './lib/roles';
export { SessionProvider, useSession } from './model/session-context';
