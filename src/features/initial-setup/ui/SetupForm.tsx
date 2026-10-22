'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/shared/api/http';
import { messageOf } from '@/shared/lib/error-message';
import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
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
      setError(messageOf(caught));
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className='space-y-4'>
      <Field label='Setup code'>
        <Input
          className='uppercase'
          autoComplete='off'
          spellCheck={false}
          placeholder='XXXX-XXXX-XXXX'
          value={code}
          onChange={(event) => setCode(event.target.value)}
        />
        <span className='text-muted mt-1.5 block font-normal'>
          Printed in the server log, on the line that starts with [setup].
        </span>
      </Field>
      <div className='grid gap-4 sm:grid-cols-2'>
        <Field label='Archive name'>
          <Input maxLength={60} value={siteName} onChange={(event) => setSiteName(event.target.value)} />
        </Field>
        <Field label='Organisation'>
          <Input
            maxLength={80}
            value={organization}
            onChange={(event) => setOrganization(event.target.value)}
          />
        </Field>
      </div>
      <p className='text-muted -mt-1 text-sm'>
        Shown in the header and on the home page. The logo and texts can be changed later in Dashboard ›
        Branding.
      </p>
      <Field label='Super admin username'>
        <Input
          autoComplete='username'
          spellCheck={false}
          maxLength={32}
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
      </Field>
      <Field label='Password'>
        <Input
          type='password'
          autoComplete='new-password'
          minLength={8}
          maxLength={128}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </Field>
      <Field label='Repeat the password'>
        <Input
          type='password'
          autoComplete='new-password'
          value={repeat}
          onChange={(event) => setRepeat(event.target.value)}
        />
      </Field>
      {friendsEnabled && (
        <Field label='Friends passcode'>
          <Input
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
        </Field>
      )}
      {error && <Notice tone='error'>{error}</Notice>}
      <Button type='submit' className='w-full' loading={pending} disabled={!complete}>
        Create the super admin
      </Button>
    </form>
  );
}
