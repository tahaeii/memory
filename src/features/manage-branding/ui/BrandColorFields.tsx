import type { BrandColors } from '@contracts/branding';
import { DEFAULT_BRAND_COLORS, describePrimary } from '@/shared/lib/brand-theme';
import { ColorPicker } from '@/shared/ui/color-picker';
import { Field } from '@/shared/ui/Field';
import { BrandPreview } from './BrandPreview';

interface BrandColorFieldsProps {
  value: BrandColors;
  onChange: (value: BrandColors) => void;
}

/** The organisation's two colours, with a preview of both themes and a word on what was adjusted. */
export function BrandColorFields({ value, onChange }: BrandColorFieldsProps) {
  const primary = value.primary ? describePrimary(value.primary) : null;
  return (
    <fieldset>
      <legend className='text-sm font-semibold'>Brand colours</legend>
      <p className='text-muted mt-1 max-w-2xl text-xs text-pretty'>
        Choose the two colours of your organisation. The shades for hover, selection and the dark theme are
        worked out from them, and text on them is kept readable.
      </p>
      <div className='mt-3 grid gap-4 sm:grid-cols-2'>
        <Field label='Primary' hint='buttons, links, selection' as='group'>
          <ColorPicker
            label='Primary colour'
            value={value.primary}
            fallback={DEFAULT_BRAND_COLORS.primary}
            onChange={(primary) => onChange({ ...value, primary })}
          />
        </Field>
        <Field label='Secondary' hint='badges, highlights' as='group'>
          <ColorPicker
            label='Secondary colour'
            value={value.secondary}
            fallback={DEFAULT_BRAND_COLORS.secondary}
            onChange={(secondary) => onChange({ ...value, secondary })}
            align='end'
          />
        </Field>
      </div>
      <div className='mt-4'>
        <BrandPreview colors={value} />
      </div>
      {primary?.lighterInDark && (
        <p className='text-muted mt-3 text-xs text-pretty'>
          Your primary colour is dark, so the dark theme uses a lighter shade of it.
        </p>
      )}
      {primary?.darkLabels && (
        <p className='text-muted mt-3 text-xs text-pretty'>
          Button labels are set in dark text, because white would be hard to read on this colour.
        </p>
      )}
    </fieldset>
  );
}
