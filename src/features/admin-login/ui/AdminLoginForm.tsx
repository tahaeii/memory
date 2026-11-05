'use client';

import { useRouter } from 'next/navigation';
import { t } from '@i18n';
import { loginSchema } from '@contracts/schemas/account';
import { apiFetch } from '@/shared/api/http';
import { useForm } from '@/shared/lib/form';
import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
import { Input } from '@/shared/ui/Input';
import { Notice } from '@/shared/ui/Notice';

export function AdminLoginForm() {
  const router = useRouter();
  const form = useForm({
    schema: loginSchema,
    initial: { username: '', password: '' },
    onSubmit: async (credentials) => {
      await apiFetch('/auth/login', { method: 'POST', json: credentials });
      router.replace('/admin');
      router.refresh();
      return 'leaving';
    },
  });

  return (
    <form onSubmit={form.submit} noValidate className='space-y-4'>
      <Field label={t('auth.login.username')} error={form.errors.username}>
        <Input autoComplete='username' autoCapitalize='none' autoFocus {...form.field('username')} />
      </Field>
      <Field label={t('auth.login.password')} error={form.errors.password}>
        <Input type='password' autoComplete='current-password' {...form.field('password')} />
      </Field>
      {form.error && <Notice tone='error'>{form.error}</Notice>}
      <Button type='submit' className='w-full' loading={form.pending}>
        {t('auth.login.submit')}
      </Button>
    </form>
  );
}
