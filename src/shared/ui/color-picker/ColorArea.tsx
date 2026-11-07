'use client';

import type { KeyboardEvent } from 'react';
import { t } from '@i18n';
import { hsvToHex, type Hsv } from '@/shared/lib/color';
import { useDragArea } from '@/shared/lib/use-drag-area';

const thumb =
  'pointer-events-none absolute size-4 -translate-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.25),0_1px_3px_rgb(0_0_0/0.35)]';
const focus = 'focus-visible:outline-primary focus-visible:outline-2 focus-visible:outline-offset-2';

interface ColorAreaProps {
  hsv: Hsv;
  onMove: (x: number, y: number) => void;
  onKeyDown: (event: KeyboardEvent) => void;
}

/** Saturation from left to right and brightness from bottom to top, for the current hue. */
export function ColorArea({ hsv, onMove, onKeyDown }: ColorAreaProps) {
  const drag = useDragArea(onMove);
  const saturation = Math.round(hsv.s * 100);
  const brightness = Math.round(hsv.v * 100);
  return (
    <div
      role='slider'
      tabIndex={0}
      aria-label={t('ui.colorPicker.area')}
      aria-valuenow={saturation}
      aria-valuetext={t('ui.colorPicker.areaValue', { saturation, brightness })}
      onKeyDown={onKeyDown}
      {...drag}
      className={'relative h-36 cursor-crosshair touch-none rounded-lg ' + focus}
      style={{
        backgroundColor: hsvToHex({ h: hsv.h, s: 1, v: 1 }),
        backgroundImage:
          'linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)',
      }}>
      <span className={thumb} style={{ left: saturation + '%', top: 100 - brightness + '%' }} />
    </div>
  );
}

interface HueSliderProps {
  hue: number;
  onMove: (x: number) => void;
  onKeyDown: (event: KeyboardEvent) => void;
}

/** The colour wheel, unrolled. */
export function HueSlider({ hue, onMove, onKeyDown }: HueSliderProps) {
  const drag = useDragArea(onMove);
  return (
    <div
      role='slider'
      tabIndex={0}
      aria-label={t('ui.colorPicker.hue')}
      aria-valuemin={0}
      aria-valuemax={359}
      aria-valuenow={Math.round(hue)}
      onKeyDown={onKeyDown}
      {...drag}
      className={'relative h-3.5 cursor-pointer touch-none rounded-full ' + focus}
      style={{ backgroundImage: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)' }}>
      {/* Inset by the thumb's radius so it never hangs over the rounded ends. */}
      <span className='absolute inset-x-2 inset-y-0'>
        <span className={thumb + ' top-1/2'} style={{ left: (hue / 359) * 100 + '%' }} />
      </span>
    </div>
  );
}
