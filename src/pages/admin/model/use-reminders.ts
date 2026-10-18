'use client';

import type { PasscodeStatusDto, UserDto } from '@/entities/user';

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

/** The reminders to show for the signed-in account. */
export function useReminders(account: UserDto, passcode: PasscodeStatusDto | null) {
  const reminders = remindersFor(account, passcode);
  return { reminders, visible: reminders.length > 0 };
}
