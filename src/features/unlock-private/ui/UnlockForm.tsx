'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
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
      setError(caught instanceof Error ? caught.message : 'Something went wrong.');
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className='space-y-3'>
      <div className={cn(inline ? 'flex flex-wrap items-end gap-2.5' : 'space-y-4')}>
        <label className={cn('text-muted block text-sm font-semibold', inline && 'min-w-52 flex-1')}>
          Passcode
          <Input
            className='mt-1.5 h-12'
            type='password'
            autoComplete='off'
            autoFocus={!inline}
            value={passcode}
            onChange={(event) => setPasscode(event.target.value)}
            placeholder='xxxx-xxxx-xxxx'
          />
        </label>
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
