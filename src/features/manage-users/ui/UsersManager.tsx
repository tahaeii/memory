'use client';

import { useState } from 'react';
import { t } from '@i18n';
import type { UserDto } from '@/entities/user';
import { NoticeSlot } from '@/shared/ui/NoticeSlot';
import { useUserChanges } from '../model/use-user-changes';
import { CreateUserForm } from './CreateUserForm';
import { ResetPasswordDialog } from './ResetPasswordDialog';
import { UserRow } from './UserRow';

interface UsersManagerProps {
  users: UserDto[];
  onChanged: () => void;
}

/** Super admin only: create admins, block or unblock them, grant private access and reset passwords. */
export function UsersManager({ users, onChanged }: UsersManagerProps) {
  const { busyId, error, change, dismissError } = useUserChanges(onChanged);
  const [resetting, setResetting] = useState<UserDto | null>(null);

  return (
    <div className='grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]'>
      <CreateUserForm onCreated={onChanged} />

      <div className='space-y-3'>
        <NoticeSlot tone='error' message={error} onDismiss={dismissError} />
        <ul className='divide-line-soft border-line bg-surface divide-y overflow-hidden rounded-xl border'>
          {users.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              busy={busyId === user.id}
              onChange={(patch) => void change(user, patch)}
              onResetPassword={() => setResetting(user)}
            />
          ))}
        </ul>
        {users.length === 1 && <p className='text-muted px-1 text-sm'>{t('users.list.empty')}</p>}
      </div>

      <ResetPasswordDialog
        user={resetting}
        onClose={() => setResetting(null)}
        onSave={(user, password) => change(user, { password })}
      />
    </div>
  );
}
