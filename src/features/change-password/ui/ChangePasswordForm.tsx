'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/shared/api/http';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Notice } from '@/shared/ui/Notice';

/** Lets a signed-in admin replace their own password. Other devices are signed out by the server. */
export function ChangePasswordForm() {
  const router = useRouter();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [repeat, setRepeat] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(false);
    if (next !== repeat) {
      setError('The new passwords do not match.');
      return;
    }
    setPending(true);
    setError(null);
    try {
      await apiFetch('/auth/password', {
        method: 'POST',
        json: { currentPassword: current, newPassword: next },
      });
      setCurrent('');
      setNext('');
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
        Current password
        <Input
          className='mt-1.5'
          type='password'
          autoComplete='current-password'
          value={current}
          onChange={(event) => setCurrent(event.target.value)}
        />
      </label>
      <label className='text-fg block text-sm font-medium'>
        New password
        <Input
          className='mt-1.5'
          type='password'
          autoComplete='new-password'
          minLength={8}
          maxLength={128}
          value={next}
          onChange={(event) => setNext(event.target.value)}
        />
      </label>
      <label className='text-fg block text-sm font-medium'>
        Repeat the new password
        <Input
          className='mt-1.5'
          type='password'
          autoComplete='new-password'
          value={repeat}
          onChange={(event) => setRepeat(event.target.value)}
        />
      </label>
      {error && <Notice tone='error'>{error}</Notice>}
      {saved && <Notice tone='success'>Password changed. Your other devices were signed out.</Notice>}
      <Button type='submit' loading={pending} disabled={!current || next.length < 8 || !repeat}>
        Change password
      </Button>
    </form>
  );
}
