'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/shared/lib/cn';
import { messageOf } from '@/shared/lib/error-message';
import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
import { Input } from '@/shared/ui/Input';
import { unlockPrivate } from '../api/unlock';

interface UnlockFormProps {
  /** Where to go afterwards (an internal path, already validated by the page). */
  next: string;
  /** "inline" puts the field and the button on one row (home page). */
  layout?: 'stacked' | 'inline';
}

/** Asks friends for the shared passcode, then reloads the page with private photos visible. */
export function UnlockForm({ next, layout = 'stacked' }: UnlockFormProps) {
  const router = useRouter();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const inline = layout === 'inline';

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await unlockPrivate(passcode);
      router.replace(next);
      router.refresh();
    } catch (caught) {
      setError(messageOf(caught));
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className='space-y-3'>
      <div className={cn(inline ? 'flex flex-wrap items-end gap-2.5' : 'space-y-4')}>
        <Field label='Passcode' className={inline ? 'min-w-52 flex-1' : undefined}>
          <Input
            className='h-12'
            type='password'
            autoComplete='off'
            autoFocus={!inline}
            value={passcode}
            onChange={(event) => setPasscode(event.target.value)}
          />
        </Field>
        <Button
          type='submit'
          size='lg'
          className={inline ? '' : 'w-full'}
          loading={pending}
          disabled={!passcode}>
          {inline ? 'Unlock' : 'Unlock private photos'}
        </Button>
      </div>
      {error && (
        <p role='alert' className='text-danger text-sm'>
          {error}
        </p>
      )}
    </form>
  );
}
