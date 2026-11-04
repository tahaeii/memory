import { Lock } from 'lucide-react';
import type { BrandColors } from '@contracts/branding';
import { brandThemeVars, type Mode } from '@/shared/lib/brand-theme';
import { cn } from '@/shared/lib/cn';

const pill = 'inline-flex h-8 items-center rounded-lg px-3 text-[13px] font-semibold';

/** A corner of the interface in one theme, drawn with the colours being edited. */
function ThemeSample({ colors, mode }: { colors: BrandColors; mode: Mode }) {
  return (
    <div
      className={cn(mode, 'border-line bg-canvas text-fg rounded-lg border p-3 transition-colors')}
      style={brandThemeVars(colors, mode)}>
      <p className='text-muted text-xs font-medium'>{mode === 'light' ? 'Light theme' : 'Dark theme'}</p>
      <div className='border-line bg-surface shadow-card mt-2 space-y-3 rounded-lg border p-3'>
        <div className='flex flex-wrap items-center gap-2'>
          <span className={cn(pill, 'bg-primary text-on-primary transition-colors')}>Upload</span>
          <span className={cn(pill, 'bg-primary-soft text-link transition-colors')}>Preview</span>
          <span className='bg-primary relative ml-auto h-5 w-9 rounded-full transition-colors'>
            <span className='bg-on-primary absolute top-0.5 right-0.5 size-4 rounded-full transition-colors' />
          </span>
        </div>
        <div className='flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px]'>
          <span className='text-link font-semibold underline decoration-1 underline-offset-4 transition-colors'>
            Open the event
          </span>
          <span className='bg-secondary-soft text-secondary-strong inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold transition-colors'>
            <Lock className='size-3' /> Private
          </span>
        </div>
        <div className='flex gap-1.5'>
          <span className='border-primary ring-primary/20 h-9 flex-1 rounded-md border ring-2 transition-colors' />
          <span className='bg-secondary/70 h-9 flex-1 rounded-md transition-colors' />
          <span className='bg-subtle h-9 flex-1 rounded-md' />
        </div>
      </div>
    </div>
  );
}

/** Shows the chosen colours at work in both themes before they are saved. */
export function BrandPreview({ colors }: { colors: BrandColors }) {
  return (
    <div aria-hidden className='grid gap-3 sm:grid-cols-2'>
      <ThemeSample colors={colors} mode='light' />
      <ThemeSample colors={colors} mode='dark' />
    </div>
  );
}
