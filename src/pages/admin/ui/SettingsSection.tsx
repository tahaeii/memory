import { t } from '@i18n';
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
        title={t('settings.password.title')}
        description={
          account.passwordChangedAt
            ? t('settings.password.changedOn', { date: formatShortDate(account.passwordChangedAt) })
            : t('settings.password.neverChanged')
        }>
        <ChangePasswordForm />
      </Panel>
      {passcode && (
        <Panel
          title={t('settings.passcode.title')}
          description={
            passcode.updatedAt
              ? t('settings.passcode.changedOn', { date: formatShortDate(passcode.updatedAt) })
              : t('settings.passcode.initial')
          }>
          <FriendsPasscodeForm />
        </Panel>
      )}
    </div>
  );
}
