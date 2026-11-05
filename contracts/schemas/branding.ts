import { z } from 'zod';
import { t } from '@i18n';
import { BRANDING_LIMITS, HERO_STYLES } from '../branding';

const text = (max: number) =>
  z
    .string()
    .max(max, t('validation.branding.max', { max }))
    .refine((value) => !/[\u0000-\u001f\u007f]/.test(value), t('validation.branding.controlCharacters'));

/** `#rrggbb` only: these values are written into a stylesheet. */
const color = z
  .string()
  .regex(/^#[0-9a-f]{6}$/i, t('validation.branding.color'))
  .transform((value) => value.toLowerCase())
  .nullable();

export const brandingSchema = z.object({
  name: text(BRANDING_LIMITS.name),
  organization: text(BRANDING_LIMITS.organization),
  tagline: text(BRANDING_LIMITS.tagline),
  description: text(BRANDING_LIMITS.description),
  heroStyle: z.enum(HERO_STYLES),
  colors: z.object({ primary: color, secondary: color }),
});
