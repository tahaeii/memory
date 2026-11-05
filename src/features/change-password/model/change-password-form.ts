import { z } from 'zod';
import { t } from '@i18n';
import { changePasswordSchema } from '@contracts/schemas/account';

export const changePasswordFormSchema = changePasswordSchema
  .extend({ repeat: z.string().min(1, t('validation.password.repeatRequired')) })
  .refine((values) => values.newPassword === values.repeat, {
    path: ['repeat'],
    message: t('validation.password.mismatch'),
  });
