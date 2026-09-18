import { randomInt } from 'node:crypto';
import { hashPassword, safeEqual } from '@server/auth/password';
import { HttpError } from '@server/lib/errors';
import { newId } from '@server/lib/ids';
import { singleton } from '@server/lib/singleton';
import { friendsEnabled } from '@server/config';
import { setFriendsPasscode, updateBrandingRecord } from '@server/settings/settings.service';
import { userRepository } from '@server/users/user.repository';
import type { UserRecord } from '@server/users/user.types';

/** No look-alike characters (0/O, 1/I/L), so the code is easy to copy from a terminal. */
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

const state = singleton('setup-code', () => ({ code: null as string | null }));

export interface SetupInput {
  code: string;
  username: string;
  password: string;
  /** Needed while the friends area is on. */
  passcode?: string;
  siteName?: string;
  organization?: string;
}

/** Setup is done once a super admin exists. Until then /setup is open (with the code) and sign-in is not. */
export async function isSetupComplete(): Promise<boolean> {
  return (await userRepository.all()).some((user) => user.role === 'superadmin');
}

const normalize = (code: string): string => code.toUpperCase().replace(/[^A-Z0-9]/g, '');

/**
 * The one-time code that proves the person on /setup can read the server log, so a stranger who
 * finds a fresh installation first cannot claim it. A new code is made (and logged) per server start.
 */
export function setupCode(): string {
  if (!state.code) {
    const chars = Array.from({ length: 12 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('');
    state.code = [chars.slice(0, 4), chars.slice(4, 8), chars.slice(8)].join('-');
    console.info(
      '[setup] No super admin yet. Open /setup in the browser and enter this setup code: ' + state.code,
    );
  }
  return state.code;
}

/** Creates the super admin, the friends passcode and the first branding. Works exactly once. */
export async function completeSetup(input: SetupInput): Promise<UserRecord> {
  if (await isSetupComplete()) throw new HttpError(409, 'Setup is already done. Sign in instead.');
  if (!safeEqual(normalize(input.code), normalize(setupCode())))
    throw new HttpError(403, 'That setup code is not correct. Copy it from the server log.');
  if (friendsEnabled() && !input.passcode) throw new HttpError(400, 'Choose a friends passcode.');

  const passwordHash = await hashPassword(input.password);
  const user = await userRepository.mutate((users) => {
    if (users.some((item) => item.role === 'superadmin'))
      throw new HttpError(409, 'Setup is already done. Sign in instead.');
    if (users.some((item) => item.username === input.username))
      throw new HttpError(409, 'That username is already taken.');
    const now = new Date().toISOString();
    const created: UserRecord = {
      id: newId(),
      username: input.username,
      passwordHash,
      role: 'superadmin',
      privateAccess: true,
      active: true,
      sessionVersion: 1,
      createdAt: now,
      updatedAt: now,
      passwordChangedAt: now,
    };
    users.push(created);
    return created;
  });
  if (friendsEnabled() && input.passcode) await setFriendsPasscode(input.passcode);
  if (input.siteName || input.organization)
    await updateBrandingRecord((branding) => {
      branding.name = input.siteName || undefined;
      branding.organization = input.organization || undefined;
    });
  state.code = null;
  console.info('[setup] Created the super admin account "' + user.username + '".');
  return user;
}
