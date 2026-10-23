import { ExternalLink } from 'lucide-react';
import type { HeroStyle } from '@contracts/branding';
import { cn } from '@/shared/lib/cn';
import { HERO_STYLE_OPTIONS } from '../config/hero-styles';
import { HeroStylePreview } from './HeroStylePreview';

interface HeroStylePickerProps {
  value: HeroStyle;
  onChange: (value: HeroStyle) => void;
}

/** Cards for choosing how the home page opens; each can be previewed in a new tab before saving. */
export function HeroStylePicker({ value, onChange }: HeroStylePickerProps) {
  return (
    <fieldset>
      <legend className='text-sm font-semibold'>Home page</legend>
      <p className='text-muted mt-1 text-xs text-pretty'>
        Photo styles need a few public photos; with too few, the minimal style is shown until there are more.
      </p>
      <div className='mt-3 grid gap-3 sm:grid-cols-2 2xl:grid-cols-3'>
        {HERO_STYLE_OPTIONS.map((option) => {
          const selected = value === option.value;
          return (
            <div
              key={option.value}
              className={cn(
                'relative rounded-xl border p-3 transition-[border-color,background-color,box-shadow]',
                selected
                  ? 'border-primary bg-primary-soft ring-primary/15 ring-4'
                  : 'border-line hover:border-line-strong hover:shadow-card',
              )}>
              <button
                type='button'
                aria-pressed={selected}
                onClick={() => onChange(option.value)}
                className='block w-full text-left after:absolute after:inset-0 after:rounded-xl'>
                <HeroStylePreview style={option.value} />
                <span className='mt-3 block pr-20 text-sm font-semibold'>{option.title}</span>
                <span className='text-muted mt-0.5 block text-xs text-pretty'>{option.hint}</span>
              </button>
              <a
                href={'/?hero=' + option.value}
                target='_blank'
                rel='noopener'
                className='text-link hover:bg-primary/10 absolute top-[6.4rem] right-2.5 z-10 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold transition-colors'>
                Preview <ExternalLink aria-hidden className='size-3' />
              </a>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
