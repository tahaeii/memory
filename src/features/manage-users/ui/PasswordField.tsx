'use client';

import type { ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import { t } from '@i18n';
import { ACCOUNT_LIMITS } from '@contracts/schemas/account';
import { Field } from '@/shared/ui/Field';
import { IconButton } from '@/shared/ui/IconButton';
import { Input } from '@/shared/ui/Input';
import { generatePassword } from '../lib/generate-password';

interface PasswordFieldProps {
  label: string;
  help?: ReactNode;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

/**
 * Password chosen by the super admin for someone else. It is shown in plain text on purpose,
 * so it can be copied and handed over; the admin then picks their own.
 */
export function PasswordField({ label, help, error, value, onChange, onBlur }: PasswordFieldProps) {
  return (
    <Field label={label} help={help} error={error}>
      <span className='flex gap-2'>
        <Input
          name='password'
          type='text'
          autoComplete='off'
          spellCheck={false}
          maxLength={ACCOUNT_LIMITS.passwordMax}
          aria-invalid={error ? true : undefined}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
        />
        <IconButton
          label={t('users.generatePassword')}
          onClick={() => onChange(generatePassword())}
          className='border-line-strong size-11 border'>
          <RefreshCw className='size-4' />
        </IconButton>
      </span>
    </Field>
  );
}
