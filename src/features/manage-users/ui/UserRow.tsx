import { KeyRound } from 'lucide-react';
import { t } from '@i18n';
import { roleLabel } from '@/entities/session';
import type { UpdateUserInput, UserDto } from '@/entities/user';
import { cn } from '@/shared/lib/cn';
import { formatShortDate } from '@/shared/lib/format';
import { Button } from '@/shared/ui/Button';
import { Switch } from '@/shared/ui/Switch';

interface UserRowProps {
  user: UserDto;
  busy: boolean;
  onChange: (patch: UpdateUserInput) => void;
  onResetPassword: () => void;
}

/** One account with its controls. The super admin's own row has none. */
export function UserRow({ user, busy, onChange, onResetPassword }: UserRowProps) {
  const about = { role: roleLabel[user.role], date: formatShortDate(user.createdAt) };
  return (
    <li className='flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-4 sm:px-5'>
      <span
        aria-hidden
        className={cn(
          'grid size-10 shrink-0 place-items-center rounded-full font-medium uppercase transition-colors',
          user.active ? 'bg-primary-soft text-link' : 'bg-subtle text-muted',
        )}>
        {user.username.slice(0, 1)}
      </span>
      <div className='min-w-0 flex-1'>
        <p className={cn('truncate font-medium', user.active ? 'text-fg' : 'text-muted')}>
          {user.username}
          {!user.active && (
            <span className='bg-danger-soft text-danger animate-fade-in ml-2 rounded-full px-2 py-0.5 text-xs font-medium'>
              {t('users.list.blocked')}
            </span>
          )}
        </p>
        <p className='text-muted text-sm'>
          {user.passwordChangedAt === null
            ? t('users.list.addedStartingPassword', about)
            : t('users.list.added', about)}
        </p>
      </div>
      {user.role === 'superadmin' ? (
        <span className='text-muted text-sm'>{t('users.list.fullAccess')}</span>
      ) : (
        <div className='flex flex-wrap items-center gap-2'>
          <span className='text-muted flex items-center gap-2 pr-2 text-sm'>
            {t('users.list.privateItems')}
            <Switch
              checked={user.privateAccess}
              disabled={busy}
              onChange={(privateAccess) => onChange({ privateAccess })}
              label={t('users.list.privateLabel', { username: user.username })}
            />
          </span>
          <Button
            variant='ghost'
            size='sm'
            disabled={busy}
            onClick={onResetPassword}
            aria-label={t('users.list.passwordLabel', { username: user.username })}>
            <KeyRound className='size-4' />
            <span className='hidden sm:inline'>{t('users.list.password')}</span>
          </Button>
          <Button
            variant={user.active ? 'secondary' : 'primary'}
            size='sm'
            className='min-w-20'
            loading={busy}
            onClick={() => onChange({ active: !user.active })}>
            {user.active ? t('users.list.block') : t('users.list.unblock')}
          </Button>
        </div>
      )}
    </li>
  );
}
