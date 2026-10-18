'use client';

import type { PasscodeStatusDto, UserDto } from '@/entities/user';
import { Collapse } from '@/shared/ui/Collapse';
import { Notice } from '@/shared/ui/Notice';
import { useReminders } from '../model/use-reminders';

interface RemindersProps {
  account: UserDto;
  passcode: PasscodeStatusDto | null;
  onOpenSettings: () => void;
}

/** A notice about an unchanged password or passcode. It can be closed, and stays closed. */
export function Reminders({ account, passcode, onOpenSettings }: RemindersProps) {
  const { reminders, visible, dismiss } = useReminders(account, passcode);
  return (
    <Collapse open={visible}>
      <Notice tone='warning' className='mt-6' onDismiss={dismiss}>
        {reminders.map((reminder) => reminder.text).join(' ')}{' '}
        <button type='button' onClick={onOpenSettings} className='font-semibold underline underline-offset-2'>
          Change {reminders.length > 1 ? 'them' : 'it'} in Settings
        </button>
      </Notice>
    </Collapse>
  );
}
