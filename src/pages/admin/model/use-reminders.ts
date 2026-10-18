'use client';

import type { PasscodeStatusDto, UserDto } from '@/entities/user';
import { useStoredFlag } from '@/shared/lib/use-stored-flag';

interface Reminder {
  id: string;
  text: string;
}

/** Things the signed-in account should still take care of. */
function remindersFor(account: UserDto, passcode: PasscodeStatusDto | null): Reminder[] {
  const reminders: Reminder[] = [];
  if (account.passwordChangedAt === null)
    reminders.push({ id: 'password', text: 'You are still using the password you were given.' });
  if (passcode?.updatedAt === null)
    reminders.push({ id: 'passcode', text: 'The friends passcode is still the initial one.' });
  return reminders;
}

/**
 * The reminders to show, and a way to close them. Closing is remembered in this browser per
 * account; a reminder that was not there when the notice was closed brings it back.
 */
export function useReminders(account: UserDto, passcode: PasscodeStatusDto | null) {
  const reminders = remindersFor(account, passcode);
  const signature = reminders.map((reminder) => reminder.id).join('+');
  const [dismissed, setDismissed] = useStoredFlag('reminders-dismissed:' + account.id);

  return {
    reminders,
    visible: reminders.length > 0 && dismissed !== signature,
    dismiss: () => setDismissed(signature),
  };
}
