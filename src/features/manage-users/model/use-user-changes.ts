'use client';

import { useState } from 'react';
import type { UpdateUserInput, UserDto } from '@/entities/user';
import { messageOf } from '@/shared/lib/error-message';
import { updateUser } from '../api/users-api';

/** Applies a change to one admin at a time and remembers which row is busy and what went wrong. */
export function useUserChanges(onChanged: () => void) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /** Resolves to true when the change was saved. */
  const change = async (user: UserDto, patch: UpdateUserInput): Promise<boolean> => {
    setBusyId(user.id);
    setError(null);
    try {
      await updateUser(user.id, patch);
      onChanged();
      return true;
    } catch (caught) {
      setError(messageOf(caught));
      return false;
    } finally {
      setBusyId(null);
    }
  };

  return { busyId, error, change, dismissError: () => setError(null) };
}
