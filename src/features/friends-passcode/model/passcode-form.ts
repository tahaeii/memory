import { z } from 'zod';
import { t } from '@i18n';
import { newPasscodeSchema } from '@contracts/schemas/account';

export const passcodeFormSchema = z
  .object({
    passcode: z.string().trim().min(1, t('validation.passcode.chooseRequired')).pipe(newPasscodeSchema),
    repeat: z.string().trim().min(1, t('validation.passcode.repeatRequired')),
  })
  .refine((values) => values.passcode === values.repeat, {
    path: ['repeat'],
    message: t('validation.passcode.mismatch'),
  });
