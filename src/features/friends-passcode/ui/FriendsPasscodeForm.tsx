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
import { NoticeSlot } from '@/shared/ui/NoticeSlot';
import { passcodeFormSchema } from '../model/passcode-form';

/** Sets the shared passcode friends use to unlock private items. */
export function FriendsPasscodeForm() {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const form = useForm({
    schema: passcodeFormSchema,
    initial: { passcode: '', repeat: '' },
    onSubmit: async ({ passcode }) => {
      setSaved(false);
      await apiFetch('/settings/passcode', { method: 'PUT', json: { passcode } });
      form.reset();
      setSaved(true);
      router.refresh();
    },
  });
  const { errors, field } = form;

  return (
    <form onSubmit={form.submit} noValidate className='space-y-4'>
      <Field
        label={t('settings.passcode.new')}
        help={t('settings.passcode.newHelp', { min: ACCOUNT_LIMITS.passcodeMin })}
        error={errors.passcode}>
        <Input
          type='password'
          autoComplete='off'
          maxLength={ACCOUNT_LIMITS.passcodeMax}
          {...field('passcode')}
        />
      </Field>
      <Field label={t('settings.passcode.repeat')} error={errors.repeat}>
        <Input type='password' autoComplete='off' {...field('repeat')} />
      </Field>
      <NoticeSlot tone='error' message={form.error} />
      <NoticeSlot
        tone='success'
        message={saved && t('settings.passcode.saved')}
        onDismiss={() => setSaved(false)}
      />
      <Button type='submit' loading={form.pending}>
        {t('settings.passcode.submit')}
      </Button>
    </form>
  );
}
