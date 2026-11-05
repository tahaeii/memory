'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { t } from '@i18n';
import { ACCOUNT_LIMITS } from '@contracts/schemas/account';
import { apiFetch } from '@/shared/api/http';
import { useForm } from '@/shared/lib/form';
import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
import { Input } from '@/shared/ui/Input';
import { Notice } from '@/shared/ui/Notice';
import { changePasswordFormSchema } from '../model/change-password-form';

/** Lets a signed-in admin replace their own password. Other devices are signed out by the server. */
export function ChangePasswordForm() {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const form = useForm({
    schema: changePasswordFormSchema,
    initial: { currentPassword: '', newPassword: '', repeat: '' },
    onSubmit: async ({ currentPassword, newPassword }) => {
      setSaved(false);
      await apiFetch('/auth/password', { method: 'POST', json: { currentPassword, newPassword } });
      form.reset();
      setSaved(true);
      router.refresh();
    },
  });
  const { errors, field } = form;

  return (
    <form onSubmit={form.submit} noValidate className='space-y-4'>
      <Field label={t('settings.password.current')} error={errors.currentPassword}>
        <Input type='password' autoComplete='current-password' {...field('currentPassword')} />
      </Field>
      <Field
        label={t('settings.password.new')}
        help={t('settings.password.newHelp', { min: ACCOUNT_LIMITS.passwordMin })}
        error={errors.newPassword}>
        <Input
          type='password'
          autoComplete='new-password'
          maxLength={ACCOUNT_LIMITS.passwordMax}
          {...field('newPassword')}
        />
      </Field>
      <Field label={t('settings.password.repeat')} error={errors.repeat}>
        <Input type='password' autoComplete='new-password' {...field('repeat')} />
      </Field>
      {form.error && <Notice tone='error'>{form.error}</Notice>}
      {saved && (
        <Notice tone='success' onDismiss={() => setSaved(false)}>
          {t('settings.password.saved')}
        </Notice>
      )}
      <Button type='submit' loading={form.pending}>
        {t('settings.password.submit')}
      </Button>
    </form>
  );
}
