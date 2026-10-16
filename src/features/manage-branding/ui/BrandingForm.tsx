'use client';

import { useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ExternalLink, ImageUp, Lock, LockOpen, Trash2 } from 'lucide-react';
import { BRANDING_LIMITS, type BrandingDto, type HeroStyle } from '@contracts/branding';
import { apiFetch } from '@/shared/api/http';
import { useSite } from '@/shared/config/site-context';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { Input, Textarea } from '@/shared/ui/Input';
import { Logo } from '@/shared/ui/Logo';
import { Notice } from '@/shared/ui/Notice';

const STYLES: Array<{ value: HeroStyle; title: string; hint: string }> = [
  { value: 'wall', title: 'Photo wall', hint: 'Text beside slowly moving columns of recent photos.' },
  {
    value: 'filmstrip',
    title: 'Filmstrip',
    hint: 'Centred text above two rows of photos drifting sideways.',
  },
  { value: 'mosaic', title: 'Mosaic', hint: 'Text beside an editorial grid of five recent photos.' },
  {
    value: 'slideshow',
    title: 'Slideshow',
    hint: 'Recent photos one after another, across the whole width.',
  },
  { value: 'cover', title: 'Cover photo', hint: "The latest event's cover across the whole width." },
  { value: 'editorial', title: 'Editorial', hint: 'A large headline with small photos set into the words.' },
  { value: 'minimal', title: 'Minimal', hint: 'Logo and words only, no photos.' },
];

const bar = 'block rounded-full';

/** A tiny drawing of each home page style. */
function StylePreview({ style }: { style: HeroStyle }) {
  const text = (
    <>
      <span className={cn(bar, 'bg-fg h-1.5 w-4/5')} />
      <span className={cn(bar, 'bg-primary h-1.5 w-3/5')} />
      <span className={cn(bar, 'bg-line-strong h-1 w-full')} />
    </>
  );
  const frame = 'relative block h-20 overflow-hidden rounded-lg';
  switch (style) {
    case 'cover':
    case 'slideshow':
      return (
        <span aria-hidden className={cn(frame, 'bg-gradient-to-br from-slate-500 to-slate-800')}>
          <span className='absolute inset-0 bg-gradient-to-r from-slate-950/80 to-transparent' />
          <span className='absolute bottom-3 left-3 flex w-1/2 flex-col gap-1'>
            <span className={cn(bar, 'h-1.5 w-full bg-white')} />
            <span className={cn(bar, 'h-1.5 w-2/3 bg-white/70')} />
          </span>
          {style === 'slideshow' && (
            <span className='absolute right-3 bottom-3 flex gap-1'>
              <span className={cn(bar, 'h-0.5 w-4 bg-white')} />
              <span className={cn(bar, 'h-0.5 w-4 bg-white/40')} />
              <span className={cn(bar, 'h-0.5 w-4 bg-white/40')} />
            </span>
          )}
        </span>
      );
    case 'filmstrip':
      return (
        <span aria-hidden className={cn(frame, 'bg-canvas flex flex-col items-center gap-1 pt-2.5')}>
          <span className={cn(bar, 'bg-fg h-1.5 w-1/2')} />
          <span className={cn(bar, 'bg-primary h-1.5 w-1/3')} />
          <span className='mt-1.5 flex gap-1'>
            {['bg-primary/50', 'bg-secondary/50', 'bg-primary/40', 'bg-secondary/40', 'bg-primary/50'].map(
              (tone, index) => (
                <span key={index} className={cn('block h-5 w-7 rounded', tone)} />
              ),
            )}
          </span>
          <span className='-ml-6 flex gap-1'>
            {['bg-secondary/50', 'bg-primary/40', 'bg-secondary/40', 'bg-primary/50', 'bg-secondary/50'].map(
              (tone, index) => (
                <span key={index} className={cn('block h-5 w-7 rounded', tone)} />
              ),
            )}
          </span>
        </span>
      );
    case 'mosaic':
      return (
        <span aria-hidden className={cn(frame, 'bg-canvas flex gap-3 p-3')}>
          <span className='flex flex-1 flex-col justify-center gap-1.5'>{text}</span>
          <span className='grid flex-1 grid-cols-3 grid-rows-3 gap-0.5'>
            <span className='bg-primary/50 col-span-2 row-span-2 rounded' />
            <span className='bg-secondary/50 rounded' />
            <span className='bg-primary/40 rounded' />
            <span className='bg-secondary/40 rounded' />
            <span className='bg-primary/30 col-span-2 rounded' />
          </span>
        </span>
      );
    case 'editorial':
      return (
        <span
          aria-hidden
          className={cn(frame, 'bg-canvas flex flex-col items-center justify-center gap-1.5')}>
          <span className='flex items-center gap-1'>
            <span className={cn(bar, 'bg-fg h-2 w-8')} />
            <span className={cn(bar, 'bg-secondary/60 h-2.5 w-6')} />
            <span className={cn(bar, 'bg-fg h-2 w-12')} />
          </span>
          <span className='flex items-center gap-1'>
            <span className={cn(bar, 'bg-primary/60 h-2.5 w-6')} />
            <span className={cn(bar, 'bg-primary h-2 w-16')} />
          </span>
          <span className={cn(bar, 'bg-line-strong h-1 w-1/2')} />
        </span>
      );
    case 'minimal':
      return (
        <span
          aria-hidden
          className={cn(frame, 'bg-canvas flex flex-col items-center justify-center gap-1.5')}>
          <span className='bg-primary block size-4 rounded' />
          <span className={cn(bar, 'bg-fg h-1.5 w-1/2')} />
          <span className={cn(bar, 'bg-primary h-1.5 w-1/3')} />
        </span>
      );
    default:
      return (
        <span aria-hidden className={cn(frame, 'bg-canvas flex gap-3 p-3')}>
          <span className='flex flex-1 flex-col justify-center gap-1.5'>{text}</span>
          <span className='grid flex-1 grid-cols-3 gap-1'>
            {[0, 1, 2].map((column) => (
              <span key={column} className={cn('flex flex-col gap-1', column === 1 && '-mt-3')}>
                <span className='bg-primary/50 block h-8 rounded' />
                <span className='bg-secondary/50 block h-10 rounded' />
              </span>
            ))}
          </span>
        </span>
      );
  }
}

/** Super admin: the name, the texts, the logo and the home page style of this installation. */
export function BrandingForm() {
  const router = useRouter();
  const site = useSite();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(site.name);
  const [organization, setOrganization] = useState(site.organization);
  const [tagline, setTagline] = useState(site.tagline);
  const [description, setDescription] = useState(site.description);
  const [heroStyle, setHeroStyle] = useState<HeroStyle>(site.heroStyle);
  const [logoUrl, setLogoUrl] = useState(site.logoUrl);
  const [customLogo, setCustomLogo] = useState(site.customLogo);
  const [pending, setPending] = useState<'texts' | 'logo' | null>(null);
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  function applied(branding: BrandingDto, text: string) {
    setLogoUrl(branding.logoUrl);
    setCustomLogo(branding.customLogo);
    setMessage({ tone: 'success', text });
    router.refresh();
  }

  function failed(caught: unknown) {
    setMessage({ tone: 'error', text: caught instanceof Error ? caught.message : 'Something went wrong.' });
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending('texts');
    setMessage(null);
    try {
      const branding = await apiFetch<BrandingDto>('/branding', {
        method: 'PUT',
        json: { name, organization, tagline, description, heroStyle },
      });
      setName(branding.name);
      setOrganization(branding.organization);
      setTagline(branding.tagline);
      setDescription(branding.description);
      applied(branding, 'Saved. Every visitor sees the new branding now.');
    } catch (caught) {
      failed(caught);
    } finally {
      setPending(null);
    }
  }

  async function upload(file: File | undefined) {
    if (!file) return;
    setPending('logo');
    setMessage(null);
    try {
      applied(await apiFetch<BrandingDto>('/branding/logo', { method: 'PUT', file }), 'Logo updated.');
    } catch (caught) {
      failed(caught);
    } finally {
      setPending(null);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function removeLogo() {
    setPending('logo');
    setMessage(null);
    try {
      applied(
        await apiFetch<BrandingDto>('/branding/logo', { method: 'DELETE' }),
        'Back to the default logo.',
      );
    } catch (caught) {
      failed(caught);
    } finally {
      setPending(null);
    }
  }

  const field = 'block text-sm font-semibold';
  return (
    <div className='grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]'>
      <form onSubmit={save} className='space-y-6'>
        <div className='grid gap-4 sm:grid-cols-2'>
          <label className={field}>
            Archive name
            <Input
              className='mt-1.5 font-normal'
              required
              maxLength={BRANDING_LIMITS.name}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <label className={field}>
            Organisation
            <Input
              className='mt-1.5 font-normal'
              maxLength={BRANDING_LIMITS.organization}
              value={organization}
              onChange={(event) => setOrganization(event.target.value)}
            />
          </label>
        </div>
        <label className={field}>
          Tagline <span className='text-muted font-normal'>(small line above the home page heading)</span>
          <Input
            className='mt-1.5 font-normal'
            maxLength={BRANDING_LIMITS.tagline}
            value={tagline}
            onChange={(event) => setTagline(event.target.value)}
          />
        </label>
        <label className={field}>
          Description <span className='text-muted font-normal'>(under the home page heading)</span>
          <Textarea
            className='mt-1.5 font-normal'
            rows={3}
            maxLength={BRANDING_LIMITS.description}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>

        <fieldset>
          <legend className='text-sm font-semibold'>Home page</legend>
          <p className='text-muted mt-1 text-xs'>
            Photo styles need a few public photos; with too few, the minimal style is shown until there are
            more.
          </p>
          <div className='mt-3 grid gap-3 sm:grid-cols-2 2xl:grid-cols-3'>
            {STYLES.map((style) => {
              const selected = heroStyle === style.value;
              return (
                <div
                  key={style.value}
                  className={cn(
                    'relative rounded-2xl border p-3 transition',
                    selected
                      ? 'border-primary bg-primary-soft ring-primary/20 ring-4'
                      : 'border-line hover:border-line-strong',
                  )}>
                  <button
                    type='button'
                    aria-pressed={selected}
                    onClick={() => setHeroStyle(style.value)}
                    className='block w-full text-left after:absolute after:inset-0 after:rounded-2xl'>
                    <StylePreview style={style.value} />
                    <span className='mt-3 block pr-16 text-sm font-semibold'>{style.title}</span>
                    <span className='text-muted mt-0.5 block text-xs'>{style.hint}</span>
                  </button>
                  <a
                    href={'/?hero=' + style.value}
                    target='_blank'
                    rel='noopener'
                    className='text-link hover:bg-primary-soft absolute top-[6.4rem] right-2.5 z-10 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold'>
                    Preview <ExternalLink className='size-3' />
                  </a>
                </div>
              );
            })}
          </div>
        </fieldset>

        <div className='flex flex-wrap items-center gap-3'>
          <Button type='submit' loading={pending === 'texts'} disabled={!name.trim()}>
            Save branding
          </Button>
          <span className='text-muted text-xs'>Empty fields go back to the defaults.</span>
        </div>
      </form>

      <aside className='space-y-4'>
        <div className='border-line-soft bg-canvas rounded-2xl border p-5'>
          <p className='text-sm font-semibold'>Logo</p>
          <div className='border-line bg-surface mt-3 grid place-items-center rounded-xl border p-6'>
            <img src={logoUrl} alt='Current logo' className='size-20 rounded-2xl object-contain' />
          </div>
          <input
            ref={fileRef}
            type='file'
            accept='image/png,image/jpeg,image/webp,image/avif'
            className='sr-only'
            onChange={(event) => void upload(event.target.files?.[0])}
          />
          <div className='mt-3 flex gap-2'>
            <Button
              variant='secondary'
              size='sm'
              className='flex-1'
              loading={pending === 'logo'}
              onClick={() => fileRef.current?.click()}>
              <ImageUp className='size-4' /> Upload logo
            </Button>
            {customLogo && (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => void removeLogo()}
                aria-label='Use the default logo'>
                <Trash2 className='size-4' />
              </Button>
            )}
          </div>
          <p className='text-muted mt-2.5 text-xs leading-relaxed'>
            PNG, JPEG, WebP or AVIF, square works best. Also used as the browser icon.
          </p>
        </div>

        <div className='border-line-soft bg-canvas rounded-2xl border p-5'>
          <p className='text-sm font-semibold'>Header preview</p>
          <div className='border-line bg-surface mt-3 rounded-xl border px-4 py-3'>
            <Logo name={name || site.name} src={logoUrl} />
          </div>
        </div>

        <div className='border-line-soft bg-canvas flex gap-3 rounded-2xl border p-5 text-sm'>
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

        {message && <Notice tone={message.tone}>{message.text}</Notice>}
      </aside>
    </div>
  );
}
