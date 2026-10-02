'use client';

import { useState, type FormEvent } from 'react';
import { KeyRound } from 'lucide-react';
import { roleLabel } from '@/entities/session';
import type { UpdateUserInput, UserDto } from '@/entities/user';
import { cn } from '@/shared/lib/cn';
import { formatShortDate } from '@/shared/lib/format';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import { Notice } from '@/shared/ui/Notice';
import { Switch } from '@/shared/ui/Switch';
import { updateUser } from '../api/users-api';
import { CreateUserForm } from './CreateUserForm';
import { PasswordField } from './PasswordField';

interface UsersManagerProps {
  users: UserDto[];
  onChanged: () => void;
}

/** Super admin only: create admins, block or unblock them, grant private access and reset passwords. */
export function UsersManager({ users, onChanged }: UsersManagerProps) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resetting, setResetting] = useState<UserDto | null>(null);

  async function change(user: UserDto, patch: UpdateUserInput): Promise<boolean> {
    setBusyId(user.id);
    setError(null);
    try {
      await updateUser(user.id, patch);
      onChanged();
      return true;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Something went wrong.');
      return false;
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className='grid items-start gap-6 lg:grid-cols-[minmax(0,22rem)_1fr]'>
      <CreateUserForm onCreated={onChanged} />

      <div className='space-y-3'>
        {error && <Notice tone='error'>{error}</Notice>}
        <ul className='divide-line-soft border-line bg-surface divide-y overflow-hidden rounded-3xl border'>
          {users.map((user) => {
            const isSuper = user.role === 'superadmin';
            const busy = busyId === user.id;
            return (
              <li key={user.id} className='flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4'>
                <span
                  aria-hidden
                  className={cn(
                    'grid size-10 shrink-0 place-items-center rounded-full font-medium uppercase',
                    user.active ? 'bg-primary-soft text-link' : 'bg-subtle text-muted',
                  )}>
                  {user.username.slice(0, 1)}
                </span>
                <div className='min-w-0 flex-1'>
                  <p className={cn('truncate font-medium', user.active ? 'text-fg' : 'text-muted')}>
                    {user.username}
                    {!user.active && (
                      <span className='bg-danger-soft text-danger ml-2 rounded-full px-2 py-0.5 text-xs font-medium'>
                        Blocked
                      </span>
                    )}
                  </p>
                  <p className='text-muted text-sm'>
                    {roleLabel[user.role]}, added {formatShortDate(user.createdAt)}
                    {user.passwordChangedAt === null && ', still on the starting password'}
                  </p>
                </div>
                {isSuper ? (
                  <span className='text-muted text-sm'>Full access</span>
                ) : (
                  <div className='flex flex-wrap items-center gap-2'>
                    <span className='text-muted flex items-center gap-2 pr-2 text-sm'>
                      Private items
                      <Switch
                        checked={user.privateAccess}
                        disabled={busy}
                        onChange={(value) => void change(user, { privateAccess: value })}
                        label={'Access to private items for ' + user.username}
                      />
                    </span>
                    <Button
                      variant='ghost'
                      size='sm'
                      disabled={busy}
                      onClick={() => setResetting(user)}
                      aria-label={'Set a new password for ' + user.username}>
                      <KeyRound className='size-4' />
                      <span className='hidden sm:inline'>Password</span>
                    </Button>
                    <Button
                      variant={user.active ? 'secondary' : 'primary'}
                      size='sm'
                      loading={busy}
                      onClick={() => void change(user, { active: !user.active })}>
                      {user.active ? 'Block' : 'Unblock'}
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        {users.length === 1 && (
          <p className='text-muted px-1 text-sm'>No other admins yet. Create one with the form.</p>
        )}
      </div>

      <ResetPasswordDialog
        user={resetting}
        onClose={() => setResetting(null)}
        onSave={async (user, password) => {
          if (await change(user, { password })) setResetting(null);
        }}
        busy={resetting !== null && busyId === resetting.id}
      />
    </div>
  );
}

interface ResetPasswordDialogProps {
  user: UserDto | null;
  busy: boolean;
  onClose: () => void;
  onSave: (user: UserDto, password: string) => Promise<void>;
}

function ResetPasswordDialog({ user, busy, onClose, onSave }: ResetPasswordDialogProps) {
  const [password, setPassword] = useState('');

  function close() {
    setPassword('');
    onClose();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    await onSave(user, password);
    setPassword('');
  }

  return (
    <Modal open={user !== null} title={'New password for ' + (user?.username ?? '')} onClose={close}>
      <form onSubmit={submit} className='mt-3 space-y-4'>
        <p className='text-muted text-sm'>
          They are signed out everywhere and must use this password next time.
        </p>
        <PasswordField label='Password' value={password} onChange={setPassword} />
        <div className='flex justify-end gap-2'>
          <Button variant='ghost' onClick={close}>
            Cancel
          </Button>
          <Button type='submit' loading={busy} disabled={password.length < 8}>
            Set password
          </Button>
        </div>
      </form>
    </Modal>
  );
}
