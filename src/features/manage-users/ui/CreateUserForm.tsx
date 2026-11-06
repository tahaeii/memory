'use client';

import { useState } from 'react';
import { t } from '@i18n';
import { ACCOUNT_LIMITS, createUserSchema } from '@contracts/schemas/account';
import { useForm } from '@/shared/lib/form';
import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
import { Input } from '@/shared/ui/Input';
import { Notice } from '@/shared/ui/Notice';
import { Switch } from '@/shared/ui/Switch';
import { createUser } from '../api/users-api';
import { PasswordField } from './PasswordField';

/** Creates an admin account with a username, a starting password and optional private access. */
export function CreateUserForm({ onCreated }: { onCreated: () => void }) {
  const [created, setCreated] = useState<string | null>(null);
  const form = useForm({
    schema: createUserSchema,
    initial: { username: '', password: '', privateAccess: false },
    onSubmit: async (input) => {
      setCreated(null);
      const user = await createUser(input);
      form.reset();
      setCreated(user.username);
      onCreated();
    },
  });
  const { values, errors } = form;
  const password = form.field('password');

  return (
    <form
      onSubmit={form.submit}
      noValidate
      className='border-line bg-surface h-fit space-y-4 rounded-xl border p-4 sm:p-5'>
      <h3 className='type-heading'>{t('users.create.title')}</h3>
      <Field label={t('users.create.username')} error={errors.username}>
        <Input
          autoComplete='off'
          autoCapitalize='none'
          spellCheck={false}
          maxLength={ACCOUNT_LIMITS.usernameMax}
          placeholder={t('users.create.usernamePlaceholder')}
          {...form.field('username')}
        />
      </Field>
      <PasswordField
        label={t('users.create.password')}
        help={t('users.create.passwordHelp', { min: ACCOUNT_LIMITS.passwordMin })}
        error={errors.password}
        value={values.password}
        onChange={(value) => form.set('password', value)}
        onBlur={password.onBlur}
      />
      <div className='flex items-start justify-between gap-4'>
        <div className='text-sm'>
          <p className='text-fg font-medium'>{t('users.create.privateTitle')}</p>
          <p className='text-muted mt-0.5'>{t('users.create.privateHint')}</p>
        </div>
        <Switch
          checked={values.privateAccess ?? false}
          onChange={(value) => form.set('privateAccess', value)}
          label={t('users.create.privateLabel')}
        />
      </div>
      {form.error && <Notice tone='error'>{form.error}</Notice>}
      {created && (
        <Notice tone='success' onDismiss={() => setCreated(null)}>
          {t('users.create.created', { username: created })}
        </Notice>
      )}
      <Button type='submit' loading={form.pending}>
        {t('users.create.submit')}
      </Button>
    </form>
  );
}
