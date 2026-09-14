import type { CreateUserInput, UpdateUserInput, UserDto } from '@contracts/user';
import { hashPassword, UNUSABLE_HASH, verifyPassword } from '@server/auth/password';
import { HttpError } from '@server/lib/errors';
import { newId } from '@server/lib/ids';
import { userRepository } from './user.repository';
import type { UserRecord } from './user.types';

export function toUserDto(user: UserRecord): UserDto {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    privateAccess: user.role === 'superadmin' || user.privateAccess,
    active: user.active,
    createdAt: user.createdAt,
    passwordChangedAt: user.passwordChangedAt,
  };
}

/**
 * Checks a username and password. An unknown username still costs one scrypt run,
 * so the response time does not reveal which part was wrong.
 */
export async function authenticate(username: string, password: string): Promise<UserRecord | null> {
  const user = await userRepository.findByUsername(username.trim().toLowerCase());
  const valid = await verifyPassword(password, user?.passwordHash ?? UNUSABLE_HASH);
  return user && valid ? user : null;
}

export async function getUser(id: string): Promise<UserRecord | null> {
  return userRepository.findById(id);
}

/** All staff accounts: the super admin first, then by username. */
export async function listUsers(): Promise<UserDto[]> {
  const users = await userRepository.all();
  return [...users]
    .sort((a, b) =>
      a.role !== b.role ? (a.role === 'superadmin' ? -1 : 1) : a.username.localeCompare(b.username),
    )
    .map(toUserDto);
}

/** Creates an admin account (only the super admin may call this). */
export async function createUser(input: CreateUserInput): Promise<UserDto> {
  const passwordHash = await hashPassword(input.password);
  const now = new Date().toISOString();
  const user = await userRepository.mutate((users) => {
    if (users.some((item) => item.username === input.username))
      throw new HttpError(409, 'That username is already taken.');
    const created: UserRecord = {
      id: newId(),
      username: input.username,
      passwordHash,
      role: 'admin',
      privateAccess: input.privateAccess,
      active: true,
      sessionVersion: 1,
      createdAt: now,
      updatedAt: now,
      passwordChangedAt: null,
    };
    users.push(created);
    return created;
  });
  return toUserDto(user);
}

/** Blocks/unblocks an admin, changes their private access or sets a new password for them. */
export async function updateUser(id: string, patch: UpdateUserInput): Promise<UserDto> {
  const passwordHash = patch.password ? await hashPassword(patch.password) : null;
  const user = await userRepository.mutate((users) => {
    const target = users.find((item) => item.id === id);
    if (!target) throw new HttpError(404, 'User not found.');
    if (target.role === 'superadmin')
      throw new HttpError(403, 'The super admin account cannot be changed here.');

    let endSessions = false;
    if (patch.active !== undefined && patch.active !== target.active) {
      target.active = patch.active;
      endSessions = true;
    }
    if (patch.privateAccess !== undefined) target.privateAccess = patch.privateAccess;
    if (passwordHash) {
      target.passwordHash = passwordHash;
      target.passwordChangedAt = null;
      endSessions = true;
    }
    if (endSessions) target.sessionVersion += 1;
    target.updatedAt = new Date().toISOString();
    return target;
  });
  return toUserDto(user);
}

/**
 * Changes the signed-in user's own password and ends their other sessions.
 * Returns null when the current password is wrong.
 */
export async function changeOwnPassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<UserRecord | null> {
  const user = await userRepository.findById(userId);
  if (!user || !user.active) throw new HttpError(401, 'Please sign in again.');
  if (!(await verifyPassword(currentPassword, user.passwordHash))) return null;
  if (currentPassword === newPassword)
    throw new HttpError(400, 'Choose a password that is different from the current one.');

  const passwordHash = await hashPassword(newPassword);
  return userRepository.mutate((users) => {
    const target = users.find((item) => item.id === userId);
    if (!target) throw new HttpError(401, 'Please sign in again.');
    const now = new Date().toISOString();
    target.passwordHash = passwordHash;
    target.passwordChangedAt = now;
    target.updatedAt = now;
    target.sessionVersion += 1;
    return target;
  });
}
