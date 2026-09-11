import type { StaffRole } from './session';

export interface UserDto {
  id: string;
  username: string;
  role: StaffRole;
  /** May see, upload and manage private items. Always true for the super admin. */
  privateAccess: boolean;
  /** Blocked users cannot sign in, and their open sessions stop working. */
  active: boolean;
  createdAt: string;
  /** Null while the user still has the password someone else gave them. */
  passwordChangedAt: string | null;
}

export interface CreateUserInput {
  username: string;
  password: string;
  privateAccess: boolean;
}

export interface UpdateUserInput {
  active?: boolean;
  privateAccess?: boolean;
  /** Sets a new password chosen by the super admin. */
  password?: string;
}

export interface PasscodeStatusDto {
  /** Null while the friends passcode is still the initial one. */
  updatedAt: string | null;
}
