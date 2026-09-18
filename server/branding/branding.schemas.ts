import { z } from 'zod';
import { BRANDING_LIMITS, HERO_STYLES } from '@contracts/branding';

const text = (max: number, label: string) =>
  z
    .string()
    .max(max, label + ' can be at most ' + max + ' characters.')
    .refine((value) => !/[\u0000-\u001f\u007f]/.test(value), label + ' cannot contain control characters.');

export const brandingSchema = z.object({
  name: text(BRANDING_LIMITS.name, 'The name'),
  organization: text(BRANDING_LIMITS.organization, 'The organisation'),
  tagline: text(BRANDING_LIMITS.tagline, 'The tagline'),
  description: text(BRANDING_LIMITS.description, 'The description'),
  heroStyle: z.enum(HERO_STYLES),
});
