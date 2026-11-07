'use client';

import { useId } from 'react';
import { Check, ChevronDown, RotateCcw } from 'lucide-react';
import { t } from '@i18n';
import { cn } from '@/shared/lib/cn';
import { readableOn } from '@/shared/lib/color';
import { usePopover } from '@/shared/lib/use-popover';
import { fieldStyles, Input } from '../Input';
import { PopoverPanel } from '../Popover';
import { ColorArea, HueSlider } from './ColorArea';
import { useColorPicker } from './use-color-picker';

/** Starting points that work well as a brand colour in both themes. */
const PRESETS = ['#2450c8', '#0b7a75', '#2f7d4f', '#b7791f', '#c2552d', '#b4233c', '#7b3fa6', '#2b3442'];

interface ColorPickerProps {
  /** What the colour is for: read by screen readers. */
  label: string;
  /** `#rrggbb`, or null while the built-in colour is used. */
  value: string | null;
  onChange: (value: string | null) => void;
  /** The built-in colour: shown while `value` is null and restored by "Use default". */
  fallback: string;
  presets?: readonly string[];
  align?: 'start' | 'end';
  className?: string;
}

/**
 * A colour field with its own picker: a saturation and brightness area, a hue slider, a hex field
 * and a row of presets. Drawn by the app, so it is the same in every browser.
 */
export function ColorPicker({
  label,
  value,
  onChange,
  fallback,
  presets = PRESETS,
  align = 'start',
  className,
}: ColorPickerProps) {
  const panelId = useId();
  const { rootRef, open, side, toggle } = usePopover(380);
  const color = value ?? fallback;
  const picker = useColorPicker(color, onChange);

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type='button'
        aria-label={t('ui.colorPicker.valueLabel', {
          label,
          value: value ?? t('ui.colorPicker.defaultValue'),
        })}
        aria-haspopup='dialog'
        aria-expanded={open}
        aria-controls={panelId}
        onClick={toggle}
        className={cn(
          fieldStyles,
          'flex items-center gap-2.5 pl-2.5 text-left',
          open && 'border-primary ring-primary/15 ring-4',
        )}>
        <span
          aria-hidden
          className='size-6 shrink-0 rounded-md shadow-[inset_0_0_0_1px_rgb(0_0_0/0.12)] transition-colors'
          style={{ backgroundColor: color }}
        />
        <span className='min-w-0 flex-1 truncate font-medium tabular-nums'>
          {value ? (
            value.toUpperCase()
          ) : (
            <span className='text-muted font-normal'>{t('common.actions.default')}</span>
          )}
        </span>
        <ChevronDown
          aria-hidden
          className={cn('text-muted size-4 shrink-0 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      <PopoverPanel
        id={panelId}
        role='dialog'
        aria-label={label}
        open={open}
        side={side}
        align={align}
        className='w-[min(17rem,calc(100vw-2rem))] space-y-3 p-3'>
        <ColorArea hsv={picker.hsv} onMove={picker.moveArea} onKeyDown={picker.onAreaKeyDown} />
        <HueSlider hue={picker.hsv.h} onMove={picker.moveHue} onKeyDown={picker.onHueKeyDown} />

        <div className='flex items-center gap-2'>
          <Input
            aria-label={t('ui.colorPicker.hex')}
            value={picker.text}
            onChange={(event) => picker.type(event.target.value)}
            onBlur={picker.settleText}
            maxLength={7}
            spellCheck={false}
            autoComplete='off'
            className='h-9 flex-1 px-3 font-medium uppercase tabular-nums'
          />
          {value && (
            <button
              type='button'
              onClick={() => onChange(null)}
              className='text-muted hover:bg-subtle hover:text-fg inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium transition-colors'>
              <RotateCcw aria-hidden className='size-3.5' /> {t('common.actions.default')}
            </button>
          )}
        </div>

        <div role='group' aria-label={t('ui.colorPicker.presets')} className='flex justify-between gap-1'>
          {presets.map((preset) => (
            <button
              key={preset}
              type='button'
              aria-label={preset}
              aria-pressed={preset === value}
              onClick={() => onChange(preset)}
              className='focus-visible:outline-primary grid size-6 place-items-center rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.12)] transition-transform hover:scale-115 focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-95'
              style={{ backgroundColor: preset, color: readableOn(preset) }}>
              {preset === value && <Check aria-hidden className='animate-check size-3.5' strokeWidth={3} />}
            </button>
          ))}
        </div>
      </PopoverPanel>
    </div>
  );
}
