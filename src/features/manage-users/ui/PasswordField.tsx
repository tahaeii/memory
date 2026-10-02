'use client';

import { RefreshCw } from 'lucide-react';
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
    <label className='text-fg block text-sm font-medium'>
      {label}
      <span className='mt-1.5 flex gap-2'>
        <Input
          type='text'
          autoComplete='off'
          spellCheck={false}
          minLength={8}
          maxLength={128}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          type='button'
          onClick={() => onChange(generatePassword())}
          className='hover:border-primary hover:text-link focus-visible:outline-primary border-line text-muted grid size-11 shrink-0 place-items-center rounded-xl border transition focus-visible:outline-2'
          aria-label='Generate a password'
          title='Generate a password'>
          <RefreshCw className='size-4' />
        </button>
      </span>
    </label>
  );
}
