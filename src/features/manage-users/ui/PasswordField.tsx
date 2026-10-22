'use client';

import { RefreshCw } from 'lucide-react';
import { Field } from '@/shared/ui/Field';
import { IconButton } from '@/shared/ui/IconButton';
import { Input } from '@/shared/ui/Input';
import { generatePassword } from '../lib/generate-password';

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

/**
 * Password chosen by the super admin for someone else. It is shown in plain text on purpose,
 * so it can be copied and handed over; the admin then picks their own.
 */
export function PasswordField({ label, value, onChange }: PasswordFieldProps) {
  return (
    <Field label={label}>
      <span className='flex gap-2'>
        <Input
          type='text'
          autoComplete='off'
          spellCheck={false}
          minLength={8}
          maxLength={128}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <IconButton
          label='Generate a password'
          onClick={() => onChange(generatePassword())}
          className='border-line-strong size-11 border'>
          <RefreshCw className='size-4' />
        </IconButton>
      </span>
    </Field>
  );
}
