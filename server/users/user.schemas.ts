import { z } from 'zod';

export const USERNAME_PATTERN = /^[a-z0-9][a-z0-9._-]{2,31}$/;

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(
    USERNAME_PATTERN,
    'Usernames are 3-32 characters: lowercase letters, digits, dots, dashes or underscores.',
  );

export const passwordSchema = z
  .string()
  .min(8, 'Use at least 8 characters.')
  .max(128, 'Use at most 128 characters.');

export const loginSchema = z.object({
  username: z.string().min(1, 'Enter your username.').max(100),
  password: z.string().min(1, 'Enter your password.').max(200),
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
  .refine((value) => Object.values(value).some((field) => field !== undefined), 'Nothing to update.');

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Enter your current password.').max(200),
  newPassword: passwordSchema,
});

export const passcodeSchema = z.object({
  passcode: z.string().trim().min(6, 'Use at least 6 characters.').max(64, 'Use at most 64 characters.'),
});

export const unlockSchema = z.object({ passcode: z.string().min(1, 'Enter the passcode.').max(200) });

export const setupSchema = z.object({
  code: z.string().min(1, 'Enter the setup code from the server log.').max(40),
  username: usernameSchema,
  password: passwordSchema,
  /** Required while the friends area is on (checked by the setup service). */
  passcode: passcodeSchema.shape.passcode.optional(),
  /** Name of the archive, shown in the header; can be changed later in Dashboard › Branding. */
  siteName: z.string().trim().max(60, 'Use at most 60 characters.').optional(),
  organization: z.string().trim().max(80, 'Use at most 80 characters.').optional(),
});
