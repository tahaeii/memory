import { z } from 'zod';
import { BRANDING_LIMITS, HERO_STYLES } from '@contracts/branding';

const text = (max: number, label: string) =>
  z
    .string()
    .max(max, label + ' can be at most ' + max + ' characters.')
    .refine((value) => !/[\u0000-\u001f\u007f]/.test(value), label + ' cannot contain control characters.');

/** `#rrggbb` only: these values are written into a stylesheet. */
const color = z
  .string()
  .regex(/^#[0-9a-f]{6}$/i, 'Colours are written as #rrggbb, for example #2f5bd0.')
  .transform((value) => value.toLowerCase())
  .nullable();

export const brandingSchema = z.object({
  name: text(BRANDING_LIMITS.name, 'The name'),
  organization: text(BRANDING_LIMITS.organization, 'The organisation'),
  tagline: text(BRANDING_LIMITS.tagline, 'The tagline'),
  description: text(BRANDING_LIMITS.description, 'The description'),
  heroStyle: z.enum(HERO_STYLES),
  colors: z.object({ primary: color, secondary: color }),
});
