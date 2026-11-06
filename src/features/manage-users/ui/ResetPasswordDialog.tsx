'use client';

import { z } from 'zod';
import { t } from '@i18n';
import { passwordSchema } from '@contracts/schemas/account';
import type { UserDto } from '@/entities/user';
import { useForm } from '@/shared/lib/form';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import { PasswordField } from './PasswordField';

const schema = z.object({ password: passwordSchema });

interface ResetPasswordDialogProps {
  /** The account that gets a new password; null keeps the dialog closed. */
  user: UserDto | null;
  onClose: () => void;
  /** Resolves to true when the password was saved. */
  onSave: (user: UserDto, password: string) => Promise<boolean>;
}

/** The super admin chooses a new password for an admin who lost theirs. */
export function ResetPasswordDialog({ user, onClose, onSave }: ResetPasswordDialogProps) {
  const form = useForm({
    schema,
    initial: { password: '' },
    onSubmit: async ({ password }) => {
      if (user && (await onSave(user, password))) close();
    },
  });

  function close() {
    form.reset();
    onClose();
  }

  return (
    <Modal
      open={user !== null}
      title={t('users.reset.title', { username: user?.username ?? '' })}
      onClose={close}>
      <form onSubmit={form.submit} noValidate className='mt-3 space-y-4'>
        <p className='text-muted text-sm'>{t('users.reset.hint')}</p>
        <PasswordField
          label={t('users.reset.password')}
          error={form.errors.password}
          value={form.values.password}
          onChange={(value) => form.set('password', value)}
        />
        <div className='flex justify-end gap-2'>
          <Button variant='ghost' onClick={close}>
            {t('common.actions.cancel')}
          </Button>
          <Button type='submit' loading={form.pending}>
            {t('users.reset.submit')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
