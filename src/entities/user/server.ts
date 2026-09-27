import 'server-only';
import { getServerViewer } from '@/shared/api/server-session';
import { getPasscodeStatus } from '@server/settings/settings.service';
import { isSetupComplete, setupCode } from '@server/setup/setup.service';
import { getUser, listUsers, toUserDto } from '@server/users/user.service';
import type { PasscodeStatusDto, UserDto } from './model/types';

/** The signed-in staff member's own account, or null. */
export async function loadAccount(): Promise<UserDto | null> {
  const viewer = await getServerViewer();
  const user = viewer.userId ? await getUser(viewer.userId) : null;
  return user ? toUserDto(user) : null;
}

/** Every staff account. Only call this for the super admin. */
export async function loadUsers(): Promise<UserDto[]> {
  return listUsers();
}

export async function loadPasscodeStatus(): Promise<PasscodeStatusDto> {
  return getPasscodeStatus();
}

/**
 * Whether the first super admin exists. While it does not, the setup code is made sure to be in the
 * server log (it is never sent to the browser).
 */
export async function loadSetupState(): Promise<'pending' | 'complete'> {
  if (await isSetupComplete()) return 'complete';
  setupCode();
  return 'pending';
}
