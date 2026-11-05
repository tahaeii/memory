import { z } from 'zod';
import { t } from '@i18n';

export const EVENT_LIMITS = { titleMin: 2, titleMax: 80, descriptionMax: 500 } as const;

export const eventInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(EVENT_LIMITS.titleMin, t('validation.event.titleMin', { min: EVENT_LIMITS.titleMin }))
    .max(EVENT_LIMITS.titleMax, t('validation.event.titleMax', { max: EVENT_LIMITS.titleMax })),
  /** The day of the event as YYYY-MM-DD. */
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, t('validation.event.dateRequired'))
    .refine((value) => !Number.isNaN(Date.parse(value)), t('validation.event.dateInvalid')),
  description: z
    .string()
    .trim()
    .max(
      EVENT_LIMITS.descriptionMax,
      t('validation.event.descriptionMax', { max: EVENT_LIMITS.descriptionMax }),
    )
    .default(''),
});

export const eventPatchSchema = eventInputSchema.partial();
