'use client';

import { useRef } from 'react';
import { ImageUp, Trash2 } from 'lucide-react';
import { t } from '@i18n';
import { Button } from '@/shared/ui/Button';
import { IconButton } from '@/shared/ui/IconButton';
import { LogoMark } from '@/shared/ui/Logo';

interface LogoCardProps {
  logoUrl: string;
  /** True when the logo was uploaded, so it can be removed again. */
  custom: boolean;
  busy: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
}

/** The current logo with buttons to replace it or go back to the bundled one. */
export function LogoCard({ logoUrl, custom, busy, onUpload, onRemove }: LogoCardProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div className='border-line-soft bg-canvas rounded-xl border p-4 sm:p-5'>
      <p className='text-sm font-semibold'>{t('branding.logo.title')}</p>
      <div className='border-line bg-surface mt-3 grid place-items-center rounded-lg border p-6'>
        <LogoMark src={logoUrl} alt={t('branding.logo.alt')} className='size-20' />
      </div>
      <input
        ref={fileRef}
        type='file'
        accept='image/png,image/jpeg,image/webp,image/avif'
        className='sr-only'
        tabIndex={-1}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onUpload(file);
          event.target.value = '';
        }}
      />
      <div className='mt-3 flex gap-2'>
        <Button
          variant='secondary'
          size='sm'
          className='flex-1'
          loading={busy}
          onClick={() => fileRef.current?.click()}>
          <ImageUp className='size-4' /> {t('branding.logo.upload')}
        </Button>
        {custom && (
          <IconButton label={t('branding.logo.useDefault')} disabled={busy} onClick={onRemove}>
            <Trash2 className='size-4' />
          </IconButton>
        )}
      </div>
      <p className='text-muted mt-2.5 text-xs leading-relaxed text-pretty'>{t('branding.logo.hint')}</p>
    </div>
  );
}
