'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Notice } from '@/shared/ui/Notice';
import { Switch } from '@/shared/ui/Switch';
import { createUser } from '../api/users-api';
import { PasswordField } from './PasswordField';

/** Creates an admin account with a username, a starting password and optional private access. */
export function CreateUserForm({ onCreated }: { onCreated: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [privateAccess, setPrivateAccess] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setCreated(null);
    try {
      const user = await createUser({ username, password, privateAccess });
      setCreated(user.username);
      setUsername('');
      setPassword('');
      setPrivateAccess(false);
      onCreated();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Something went wrong.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className='border-line bg-surface h-fit space-y-4 rounded-3xl border p-5'>
      <h3 className='text-fg font-medium'>New admin</h3>
      <label className='text-fg block text-sm font-medium'>
        Username
        <Input
          className='mt-1.5'
          autoComplete='off'
          spellCheck={false}
          maxLength={32}
          placeholder='e.g. sara.k'
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
      </label>
      <PasswordField label='Starting password' value={password} onChange={setPassword} />
      <div className='flex items-start justify-between gap-4'>
        <div className='text-sm'>
          <p className='text-fg font-medium'>Private items</p>
          <p className='text-muted mt-0.5'>Can see, upload and manage private items.</p>
        </div>
        <Switch checked={privateAccess} onChange={setPrivateAccess} label='Access to private items' />
      </div>
      {error && <Notice tone='error'>{error}</Notice>}
      {created && (
        <Notice tone='success'>
          “{created}” can sign in now. Share the password privately; they can change it in Settings.
        </Notice>
      )}
      <Button type='submit' loading={pending} disabled={username.trim().length < 3 || password.length < 8}>
        Create admin
      </Button>
    </form>
  );
}
