'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/shared/api/http';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';

export function AdminLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await apiFetch('/auth/login', { method: 'POST', json: { username, password } });
      router.replace('/admin');
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Something went wrong.');
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className='space-y-4'>
      <label className='text-fg block text-sm font-medium'>
        Username
        <Input
          className='mt-1.5'
          autoComplete='username'
          autoFocus
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
      </label>
      <label className='text-fg block text-sm font-medium'>
        Password
        <Input
          className='mt-1.5'
          type='password'
          autoComplete='current-password'
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      {error && (
        <p role='alert' className='text-danger text-sm'>
          {error}
        </p>
      )}
      <Button type='submit' className='w-full' loading={pending} disabled={!username || !password}>
        Sign in
      </Button>
    </form>
  );
}
