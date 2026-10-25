'use client';

import type { FormEvent } from 'react';
import { Lock, LockOpen } from 'lucide-react';
import { useSite } from '@/shared/config/site-context';
import { Button } from '@/shared/ui/Button';
import { Logo } from '@/shared/ui/Logo';
import { Notice } from '@/shared/ui/Notice';
import { useBrandingForm } from '../model/use-branding-form';
import { BrandColorFields } from './BrandColorFields';
import { HeroStylePicker } from './HeroStylePicker';
import { IdentityFields } from './IdentityFields';
import { LogoCard } from './LogoCard';

/** Super admin: the name, the texts, the colours, the logo and the home page style of this installation. */
export function BrandingForm() {
  const site = useSite();
  const form = useBrandingForm();
  const { draft, change, message } = form;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void form.save();
  };

  return (
    <div className='grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]'>
      <form onSubmit={submit} className='space-y-8'>
        <IdentityFields values={draft} onChange={change} />
        <BrandColorFields value={draft.colors} onChange={(colors) => change('colors', colors)} />
        <HeroStylePicker value={draft.heroStyle} onChange={(style) => change('heroStyle', style)} />

        <div className='space-y-3'>
          <div className='flex flex-wrap items-center gap-2'>
            <Button
              type='submit'
              loading={form.pending === 'details'}
              disabled={!form.dirty || !draft.name.trim()}>
              Save branding
            </Button>
            {form.dirty && (
              <Button variant='ghost' onClick={form.discard}>
                Discard changes
              </Button>
            )}
            <span className='text-muted text-xs'>Empty fields go back to the defaults.</span>
          </div>
          {message?.part === 'details' && (
            <Notice tone={message.tone} onDismiss={form.dismissMessage}>
              {message.text}
            </Notice>
          )}
        </div>
      </form>

      <aside className='space-y-4'>
        <LogoCard
          logoUrl={form.logo.url}
          custom={form.logo.custom}
          busy={form.pending === 'logo'}
          onUpload={(file) => void form.replaceLogo(file)}
          onRemove={() => void form.removeLogo()}
        />
        {message?.part === 'logo' && (
          <Notice tone={message.tone} onDismiss={form.dismissMessage}>
            {message.text}
          </Notice>
        )}

        <div className='border-line-soft bg-canvas rounded-xl border p-4 sm:p-5'>
          <p className='text-sm font-semibold'>Header preview</p>
          <div className='border-line bg-surface mt-3 rounded-lg border px-4 py-3'>
            <Logo name={draft.name || site.name} src={form.logo.url} />
          </div>
        </div>

        <div className='border-line-soft bg-canvas flex gap-3 rounded-xl border p-4 text-sm sm:p-5'>
          {site.friendsEnabled ? (
            <LockOpen className='text-secondary-strong mt-0.5 size-4 shrink-0' />
          ) : (
            <Lock className='text-muted mt-0.5 size-4 shrink-0' />
          )}
          <p className='text-muted'>
            <span className='text-fg font-semibold'>Friends area {site.friendsEnabled ? 'on' : 'off'}.</span>{' '}
            Set by <code className='text-fg'>FRIENDS_ENABLED</code> on the server.
          </p>
        </div>
      </aside>
    </div>
  );
}
