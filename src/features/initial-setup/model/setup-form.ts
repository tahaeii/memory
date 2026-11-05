import { z } from 'zod';
import { t } from '@i18n';
import { ACCOUNT_LIMITS, newPasscodeSchema, setupSchema } from '@contracts/schemas/account';

/**
 * What the setup form checks before it sends anything: the API's rules, plus the repeated password,
 * a required name and, while the friends area is on, a required passcode.
 */
export const setupFormSchema = (friendsEnabled: boolean) =>
  setupSchema
    .extend({
      siteName: z
        .string()
        .trim()
        .min(1, t('validation.siteName.required'))
        .max(ACCOUNT_LIMITS.siteNameMax, t('validation.siteName.max', { max: ACCOUNT_LIMITS.siteNameMax })),
      repeat: z.string().min(1, t('validation.password.repeatRequired')),
      passcode: friendsEnabled
        ? z.string().trim().min(1, t('validation.passcode.chooseRequired')).pipe(newPasscodeSchema)
        : z.string().optional(),
    })
    .refine((values) => values.password === values.repeat, {
      path: ['repeat'],
      message: t('validation.password.mismatch'),
    });
