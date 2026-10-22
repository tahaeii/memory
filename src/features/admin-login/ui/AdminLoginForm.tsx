'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/shared/api/http';
import { messageOf } from '@/shared/lib/error-message';
import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
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
      setError(messageOf(caught));
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className='space-y-4'>
      <Field label='Username'>
        <Input
          autoComplete='username'
          autoFocus
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
      </Field>
      <Field label='Password'>
        <Input
          type='password'
          autoComplete='current-password'
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </Field>
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
