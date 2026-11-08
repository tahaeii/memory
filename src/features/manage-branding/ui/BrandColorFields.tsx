import { t } from '@i18n';
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
      <legend className='text-sm font-semibold'>{t('branding.colors.title')}</legend>
      <p className='text-muted mt-1 max-w-2xl text-xs text-pretty'>{t('branding.colors.hint')}</p>
      <div className='mt-3 grid gap-4 sm:grid-cols-2'>
        <Field label={t('branding.colors.primary')} hint={t('branding.colors.primaryHint')} as='group'>
          <ColorPicker
            label={t('branding.colors.primaryLabel')}
            value={value.primary}
            fallback={DEFAULT_BRAND_COLORS.primary}
            onChange={(primary) => onChange({ ...value, primary })}
          />
        </Field>
        <Field label={t('branding.colors.secondary')} hint={t('branding.colors.secondaryHint')} as='group'>
          <ColorPicker
            label={t('branding.colors.secondaryLabel')}
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
      {primary &&
        (['darkerInLight', 'lighterInDark', 'darkLabels'] as const)
          .filter((remark) => primary[remark])
          .map((remark) => (
            <p key={remark} className='text-muted animate-fade-in mt-3 text-xs text-pretty'>
              {t(`branding.colors.${remark}`)}
            </p>
          ))}
    </fieldset>
  );
}
