'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/shared/api/http';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Notice } from '@/shared/ui/Notice';

interface SetupFormProps {
  /** Ask for the friends passcode only when the friends area is switched on. */
  friendsEnabled: boolean;
  defaultName: string;
  defaultOrganization: string;
}

/** First start: names the archive and creates the super admin (and the friends passcode) in one step. */
export function SetupForm({ friendsEnabled, defaultName, defaultOrganization }: SetupFormProps) {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [passcode, setPasscode] = useState('');
  const [siteName, setSiteName] = useState(defaultName);
  const [organization, setOrganization] = useState(defaultOrganization);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const complete =
    code.length > 0 &&
    username.trim().length >= 3 &&
    password.length >= 8 &&
    repeat.length > 0 &&
    siteName.trim().length > 0 &&
    (!friendsEnabled || passcode.trim().length >= 6);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== repeat) {
      setError('The passwords do not match.');
      return;
    }
    setPending(true);
    setError(null);
    try {
      await apiFetch('/setup', {
        method: 'POST',
        json: {
          code,
          username,
          password,
          siteName,
          organization,
          ...(friendsEnabled ? { passcode } : {}),
        },
      });
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
        Setup code
        <Input
          className='mt-1.5 uppercase'
          autoComplete='off'
          spellCheck={false}
          placeholder='XXXX-XXXX-XXXX'
          value={code}
          onChange={(event) => setCode(event.target.value)}
        />
        <span className='text-muted mt-1.5 block font-normal'>
          Printed in the server log, on the line that starts with [setup].
        </span>
      </label>
      <div className='grid gap-4 sm:grid-cols-2'>
        <label className='text-fg block text-sm font-medium'>
          Archive name
          <Input
            className='mt-1.5'
            maxLength={60}
            value={siteName}
            onChange={(event) => setSiteName(event.target.value)}
          />
        </label>
        <label className='text-fg block text-sm font-medium'>
          Organisation
          <Input
            className='mt-1.5'
            maxLength={80}
            value={organization}
            onChange={(event) => setOrganization(event.target.value)}
          />
        </label>
      </div>
      <p className='text-muted -mt-1 text-sm'>
        Shown in the header and on the home page. The logo and texts can be changed later in Dashboard ›
        Branding.
      </p>
      <label className='text-fg block text-sm font-medium'>
        Super admin username
        <Input
          className='mt-1.5'
          autoComplete='username'
          spellCheck={false}
          maxLength={32}
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
      </label>
      <label className='text-fg block text-sm font-medium'>
        Password
        <Input
          className='mt-1.5'
          type='password'
          autoComplete='new-password'
          minLength={8}
          maxLength={128}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      <label className='text-fg block text-sm font-medium'>
        Repeat the password
        <Input
          className='mt-1.5'
          type='password'
          autoComplete='new-password'
          value={repeat}
          onChange={(event) => setRepeat(event.target.value)}
        />
      </label>
      {friendsEnabled && (
        <label className='text-fg block text-sm font-medium'>
          Friends passcode
          <Input
            className='mt-1.5'
            type='password'
            autoComplete='off'
            minLength={6}
            maxLength={64}
            value={passcode}
            onChange={(event) => setPasscode(event.target.value)}
          />
          <span className='text-muted mt-1.5 block font-normal'>
            Friends of the team enter this to see private photos and videos. You can change it later.
          </span>
        </label>
      )}
      {error && <Notice tone='error'>{error}</Notice>}
      <Button type='submit' className='w-full' loading={pending} disabled={!complete}>
        Create the super admin
      </Button>
    </form>
  );
}
