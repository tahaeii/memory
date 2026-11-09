import { z } from 'zod';
import { t } from '@i18n';
import { ID_PATTERN } from '@server/lib/ids';

const id = z.string().regex(ID_PATTERN, t('validation.invalidId'));
const visibility = z.enum(['public', 'private']);

export const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(120).default(60),
  cursor: z.string().max(200).optional(),
  event: z.string().max(80).optional(),
  year: z.coerce.number().int().min(1990).max(2100).optional(),
  visibility: visibility.optional(),
  kind: z.enum(['photo', 'video']).optional(),
  deleted: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
  deletedBy: id.optional(),
});

export const uploadQuerySchema = z.object({
  name: z.string().min(1).max(255).default('upload'),
  visibility: visibility.default('public'),
  eventId: id.optional(),
  /** The file's last-modified time from the browser (ms since the epoch). */
  takenAt: z.coerce.number().int().min(0).max(4_102_444_800_000).optional(),
});

export const statusQuerySchema = z.object({
  ids: z
    .string()
    .max(1400)
    .transform((value) => value.split(',').filter(Boolean))
    .pipe(z.array(id).min(1).max(100)),
});

export const bulkPatchSchema = z
  .object({
    ids: z.array(id).min(1).max(500),
    visibility: visibility.optional(),
    eventId: id.nullable().optional(),
  })
  .refine(
    (value) => value.visibility !== undefined || value.eventId !== undefined,
    t('validation.nothingToUpdate'),
  );

export const idsSchema = z.object({ ids: z.array(id).min(1).max(500) });
