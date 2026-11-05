'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { t } from '@i18n';
import { ACCOUNT_LIMITS } from '@contracts/schemas/account';
import { useForm } from '@/shared/lib/form';
import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
import { Input } from '@/shared/ui/Input';
import { Notice } from '@/shared/ui/Notice';
import { completeSetup } from '../api/setup-api';
import { setupFormSchema } from '../model/setup-form';

interface SetupFormProps {
  /** Ask for the friends passcode only when the friends area is switched on. */
  friendsEnabled: boolean;
  defaultName: string;
  defaultOrganization: string;
}

/** First start: names the archive and creates the super admin (and the friends passcode) in one step. */
export function SetupForm({ friendsEnabled, defaultName, defaultOrganization }: SetupFormProps) {
  const router = useRouter();
  const schema = useMemo(() => setupFormSchema(friendsEnabled), [friendsEnabled]);
  const form = useForm({
    schema,
    initial: {
      code: '',
      siteName: defaultName,
      organization: defaultOrganization,
      username: '',
      password: '',
      repeat: '',
      passcode: '',
    },
    onSubmit: async ({ code, siteName, organization, username, password, passcode }) => {
      const account = { code, siteName, organization, username, password };
      await completeSetup(friendsEnabled ? { ...account, passcode } : account);
      router.replace('/admin');
      router.refresh();
      return 'leaving';
    },
  });
  const { errors, field } = form;

  return (
    <form onSubmit={form.submit} noValidate className='space-y-4'>
      <Field label={t('setup.code.label')} help={t('setup.code.help')} error={errors.code}>
        <Input
          className='uppercase'
          autoComplete='off'
          autoFocus
          spellCheck={false}
          placeholder={t('setup.code.placeholder')}
          {...field('code')}
        />
      </Field>
      <div className='grid gap-4 sm:grid-cols-2'>
        <Field label={t('setup.siteName')} error={errors.siteName}>
          <Input maxLength={ACCOUNT_LIMITS.siteNameMax} {...field('siteName')} />
        </Field>
        <Field label={t('setup.organization')} error={errors.organization}>
          <Input maxLength={ACCOUNT_LIMITS.organizationMax} {...field('organization')} />
        </Field>
      </div>
      <p className='text-muted -mt-1 text-[13px] leading-snug text-pretty'>{t('setup.namesHelp')}</p>
      <Field label={t('setup.username.label')} help={t('setup.username.help')} error={errors.username}>
        <Input
          autoComplete='username'
          autoCapitalize='none'
          spellCheck={false}
          maxLength={ACCOUNT_LIMITS.usernameMax}
          {...field('username')}
        />
      </Field>
      <Field
        label={t('setup.password.label')}
        help={t('setup.password.help', { min: ACCOUNT_LIMITS.passwordMin })}
        error={errors.password}>
        <Input
          type='password'
          autoComplete='new-password'
          maxLength={ACCOUNT_LIMITS.passwordMax}
          {...field('password')}
        />
      </Field>
      <Field label={t('setup.repeat')} error={errors.repeat}>
        <Input type='password' autoComplete='new-password' {...field('repeat')} />
      </Field>
      {friendsEnabled && (
        <Field
          label={t('setup.passcode.label')}
          help={t('setup.passcode.help', { min: ACCOUNT_LIMITS.passcodeMin })}
          error={errors.passcode}>
          <Input
            type='password'
            autoComplete='off'
            maxLength={ACCOUNT_LIMITS.passcodeMax}
            {...field('passcode')}
          />
        </Field>
      )}
      {form.error && <Notice tone='error'>{form.error}</Notice>}
      <Button type='submit' className='w-full' loading={form.pending}>
        {t('setup.submit')}
      </Button>
    </form>
  );
}
