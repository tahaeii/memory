'use client';

import type { FormEvent } from 'react';
import { Lock, LockOpen } from 'lucide-react';
import { t } from '@i18n';
import { rich } from '@i18n/rich';
import { useSite } from '@/shared/config/site-context';
import { Button } from '@/shared/ui/Button';
import { Logo } from '@/shared/ui/Logo';
import { NoticeSlot } from '@/shared/ui/NoticeSlot';
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
              {t('branding.form.save')}
            </Button>
            {form.dirty && (
              <Button variant='ghost' onClick={form.discard}>
                {t('branding.form.discard')}
              </Button>
            )}
            <span className='text-muted text-xs'>{t('branding.form.emptyHint')}</span>
          </div>
          <NoticeSlot
            tone={message?.tone ?? 'success'}
            message={message?.part === 'details' && message.text}
            onDismiss={form.dismissMessage}
          />
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
        <NoticeSlot
          tone={message?.tone ?? 'success'}
          message={message?.part === 'logo' && message.text}
          onDismiss={form.dismissMessage}
        />

        <div className='border-line-soft bg-canvas rounded-xl border p-4 sm:p-5'>
          <p className='text-sm font-semibold'>{t('branding.form.headerPreview')}</p>
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
            {rich(site.friendsEnabled ? 'branding.form.friendsOn' : 'branding.form.friendsOff', {
              b: (text) => <span className='text-fg font-semibold'>{text}</span>,
              code: (text) => <code className='text-fg'>{text}</code>,
            })}
          </p>
        </div>
      </aside>
    </div>
  );
}
