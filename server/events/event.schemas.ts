import { z } from 'zod';

export const eventInputSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters.').max(80),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the format YYYY-MM-DD.')
    .refine((value) => !Number.isNaN(Date.parse(value)), 'That date does not exist.'),
  description: z.string().trim().max(500).default(''),
});

export const eventPatchSchema = eventInputSchema.partial();
