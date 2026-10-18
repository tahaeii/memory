import type { PasscodeStatusDto, UserDto } from '@/entities/user';
import { ChangePasswordForm } from '@/features/change-password';
import { FriendsPasscodeForm } from '@/features/friends-passcode';
import { formatShortDate } from '@/shared/lib/format';
import { Panel } from '@/shared/ui/Panel';

/** The account's own password and, for staff with private access, the friends passcode. */
export function SettingsSection({
  account,
  passcode,
}: {
  account: UserDto;
  passcode: PasscodeStatusDto | null;
}) {
  return (
    <div className='grid items-start gap-4 sm:gap-6 xl:grid-cols-2'>
      <Panel
        title='Your password'
        description={
          (account.passwordChangedAt
            ? 'Last changed on ' + formatShortDate(account.passwordChangedAt) + '.'
            : 'You have not chosen your own password yet.') +
          ' Changing it signs you out on every other device.'
        }>
        <ChangePasswordForm />
      </Panel>
      {passcode && (
        <Panel
          title='Friends passcode'
          description={
            'Friends enter this to see private photos and videos. ' +
            (passcode.updatedAt
              ? 'Last changed on ' + formatShortDate(passcode.updatedAt) + '.'
              : 'It is still the initial passcode.') +
            ' Changing it locks every friend out until they enter the new one.'
          }>
          <FriendsPasscodeForm />
        </Panel>
      )}
    </div>
  );
}
