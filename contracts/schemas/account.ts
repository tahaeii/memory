import { z } from 'zod';
import { t } from '@i18n';

/** Length limits for accounts, shared by the forms and the API. */
export const ACCOUNT_LIMITS = {
  usernameMax: 32,
  passwordMin: 8,
  passwordMax: 128,
  passcodeMin: 6,
  passcodeMax: 64,
  siteNameMax: 60,
  organizationMax: 80,
} as const;

export const USERNAME_PATTERN = /^[a-z0-9][a-z0-9._-]{2,31}$/;

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, t('validation.username.required'))
  .regex(USERNAME_PATTERN, t('validation.username.pattern'));

/** A password someone chooses (as opposed to one they sign in with). */
export const passwordSchema = z
  .string()
  .min(ACCOUNT_LIMITS.passwordMin, t('validation.password.min', { min: ACCOUNT_LIMITS.passwordMin }))
  .max(ACCOUNT_LIMITS.passwordMax, t('validation.password.max', { max: ACCOUNT_LIMITS.passwordMax }));

/** The shared passcode for friends, as someone chooses it. */
export const newPasscodeSchema = z
  .string()
  .trim()
  .min(ACCOUNT_LIMITS.passcodeMin, t('validation.passcode.min', { min: ACCOUNT_LIMITS.passcodeMin }))
  .max(ACCOUNT_LIMITS.passcodeMax, t('validation.passcode.max', { max: ACCOUNT_LIMITS.passcodeMax }));

export const loginSchema = z.object({
  username: z.string().trim().min(1, t('validation.username.required')).max(100),
  password: z.string().min(1, t('validation.password.required')).max(200),
});

export const unlockSchema = z.object({
  passcode: z.string().min(1, t('validation.passcode.required')).max(200),
});

export const createUserSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  privateAccess: z.boolean().default(false),
});

export const updateUserSchema = z
  .object({
    active: z.boolean().optional(),
    privateAccess: z.boolean().optional(),
    password: passwordSchema.optional(),
  })
  .refine(
    (value) => Object.values(value).some((field) => field !== undefined),
    t('validation.nothingToUpdate'),
  );

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, t('validation.password.currentRequired')).max(200),
  newPassword: passwordSchema,
});

export const passcodeSchema = z.object({ passcode: newPasscodeSchema });

export const setupSchema = z.object({
  code: z.string().trim().min(1, t('validation.setupCode.required')).max(40),
  username: usernameSchema,
  password: passwordSchema,
  /** Required while the friends area is on (checked by the form and by the setup service). */
  passcode: newPasscodeSchema.optional(),
  /** Name of the archive, shown in the header; can be changed later in Dashboard › Branding. */
  siteName: z
    .string()
    .trim()
    .max(ACCOUNT_LIMITS.siteNameMax, t('validation.siteName.max', { max: ACCOUNT_LIMITS.siteNameMax }))
    .optional(),
  organization: z
    .string()
    .trim()
    .max(
      ACCOUNT_LIMITS.organizationMax,
      t('validation.organization.max', { max: ACCOUNT_LIMITS.organizationMax }),
    )
    .optional(),
});
