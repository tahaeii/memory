import { createHmac } from 'node:crypto';
import { t } from '@i18n';
import { friendsEnabled } from '@server/config';
import { getSettings } from '@server/settings/settings.service';
import { userRepository } from '@server/users/user.repository';
import type { UserRecord } from '@server/users/user.types';
import { signToken, verifyToken } from './token';
import { FRIEND, GUEST, type Viewer } from './viewer';

export const SESSION_COOKIE = 'gallery_session';

export const SESSION_TTL_SECONDS = {
  staff: 60 * 60 * 24 * 7,
  friend: 60 * 60 * 24 * 30,
} as const;

/** Token subject used for friends (staff tokens carry the user id). */
const FRIEND_SUBJECT = 'friend';

function fingerprint(secret: string, material: string): string {
  return createHmac('sha256', secret).update(material).digest('base64url').slice(0, 22);
}

const staffMaterial = (user: UserRecord): string => 'user:' + user.id + ':' + user.sessionVersion;
const friendMaterial = (passcodeHash: string): string => 'friend:' + passcodeHash;
const expiresIn = (seconds: number): number => Math.floor(Date.now() / 1000) + seconds;

export function viewerFromUser(user: UserRecord): Viewer {
  return {
    role: user.role,
    userId: user.id,
    username: user.username,
    privateAccess: user.role === 'superadmin' || user.privateAccess,
  };
}

export async function createStaffToken(user: UserRecord): Promise<string> {
  const { sessionSecret } = await getSettings();
  return signToken(
    {
      sub: user.id,
      exp: expiresIn(SESSION_TTL_SECONDS.staff),
      v: fingerprint(sessionSecret, staffMaterial(user)),
    },
    sessionSecret,
  );
}

export async function createFriendToken(): Promise<string> {
  const { sessionSecret, friendsPasscodeHash } = await getSettings();
  if (!friendsPasscodeHash) throw new Error(t('errors.friends.notSet'));
  return signToken(
    {
      sub: FRIEND_SUBJECT,
      exp: expiresIn(SESSION_TTL_SECONDS.friend),
      v: fingerprint(sessionSecret, friendMaterial(friendsPasscodeHash)),
    },
    sessionSecret,
  );
}

/**
 * Turns a cookie value into a viewer. Anything invalid, expired or revoked (blocked user,
 * changed password, changed passcode) is a guest. Permissions are read live on every request.
 */
export async function resolveViewer(token: string | undefined): Promise<Viewer> {
  if (!token) return GUEST;
  try {
    const settings = await getSettings();
    const claims = verifyToken(token, settings.sessionSecret);
    if (!claims) return GUEST;
    if (claims.sub === FRIEND_SUBJECT) {
      // Switching the friends area off (FRIENDS_ENABLED=false) ends every friend session at once.
      if (!friendsEnabled() || !settings.friendsPasscodeHash) return GUEST;
      const expected = fingerprint(settings.sessionSecret, friendMaterial(settings.friendsPasscodeHash));
      return claims.v === expected ? FRIEND : GUEST;
    }
    const user = await userRepository.findById(claims.sub);
    if (!user || !user.active || claims.v !== fingerprint(settings.sessionSecret, staffMaterial(user)))
      return GUEST;
    return viewerFromUser(user);
  } catch (error) {
    console.error('[session]', error);
    return GUEST;
  }
}
