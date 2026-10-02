'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/shared/api/http';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Notice } from '@/shared/ui/Notice';

/** Sets the shared passcode friends use to unlock private items. */
export function FriendsPasscodeForm() {
  const router = useRouter();
  const [passcode, setPasscode] = useState('');
  const [repeat, setRepeat] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(false);
    if (passcode.trim() !== repeat.trim()) {
      setError('The passcodes do not match.');
      return;
    }
    setPending(true);
    setError(null);
    try {
      await apiFetch('/settings/passcode', { method: 'PUT', json: { passcode } });
      setPasscode('');
      setRepeat('');
      setSaved(true);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Something went wrong.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className='space-y-4'>
      <label className='text-fg block text-sm font-medium'>
        New passcode
        <Input
          className='mt-1.5'
          type='password'
          autoComplete='off'
          minLength={6}
          maxLength={64}
          value={passcode}
          onChange={(event) => setPasscode(event.target.value)}
        />
      </label>
      <label className='text-fg block text-sm font-medium'>
        Repeat the passcode
        <Input
          className='mt-1.5'
          type='password'
          autoComplete='off'
          value={repeat}
          onChange={(event) => setRepeat(event.target.value)}
        />
      </label>
      {error && <Notice tone='error'>{error}</Notice>}
      {saved && (
        <Notice tone='success'>
          Passcode changed. Friends were signed out and need the new passcode to see private items.
        </Notice>
      )}
      <Button type='submit' loading={pending} disabled={passcode.trim().length < 6 || !repeat}>
        Change passcode
      </Button>
    </form>
  );
}
