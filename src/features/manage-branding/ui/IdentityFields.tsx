import { t } from '@i18n';
import { BRANDING_LIMITS, type BrandingInput } from '@contracts/branding';
import { Field } from '@/shared/ui/Field';
import { Input, Textarea } from '@/shared/ui/Input';

type Texts = Pick<BrandingInput, 'name' | 'organization' | 'tagline' | 'description'>;

interface IdentityFieldsProps {
  values: Texts;
  onChange: <K extends keyof Texts>(key: K, value: string) => void;
}

/** The name of the archive and the words on the home page. */
export function IdentityFields({ values, onChange }: IdentityFieldsProps) {
  return (
    <div className='space-y-4'>
      <div className='grid gap-4 sm:grid-cols-2'>
        <Field label={t('branding.identity.name')}>
          <Input
            required
            maxLength={BRANDING_LIMITS.name}
            value={values.name}
            onChange={(event) => onChange('name', event.target.value)}
          />
        </Field>
        <Field label={t('branding.identity.organization')}>
          <Input
            maxLength={BRANDING_LIMITS.organization}
            value={values.organization}
            onChange={(event) => onChange('organization', event.target.value)}
          />
        </Field>
      </div>
      <Field label={t('branding.identity.tagline')} hint={t('branding.identity.taglineHint')}>
        <Input
          maxLength={BRANDING_LIMITS.tagline}
          value={values.tagline}
          onChange={(event) => onChange('tagline', event.target.value)}
        />
      </Field>
      <Field label={t('branding.identity.description')} hint={t('branding.identity.descriptionHint')}>
        <Textarea
          rows={3}
          maxLength={BRANDING_LIMITS.description}
          value={values.description}
          onChange={(event) => onChange('description', event.target.value)}
        />
      </Field>
    </div>
  );
}
