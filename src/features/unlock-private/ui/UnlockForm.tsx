'use client';

import { useRouter } from 'next/navigation';
import { t } from '@i18n';
import { unlockSchema } from '@contracts/schemas/account';
import { cn } from '@/shared/lib/cn';
import { useForm } from '@/shared/lib/form';
import { Button } from '@/shared/ui/Button';
import { Field } from '@/shared/ui/Field';
import { FieldError } from '@/shared/ui/FieldError';
import { Input } from '@/shared/ui/Input';
import { unlockPrivate } from '../api/unlock';

interface UnlockFormProps {
  /** Where to go afterwards (an internal path, already validated by the page). */
  next: string;
  /** "inline" puts the field and the button on one row (home page). */
  layout?: 'stacked' | 'inline';
}

/** Asks friends for the shared passcode, then reloads the page with private photos visible. */
export function UnlockForm({ next, layout = 'stacked' }: UnlockFormProps) {
  const router = useRouter();
  const inline = layout === 'inline';
  const form = useForm({
    schema: unlockSchema,
    initial: { passcode: '' },
    onSubmit: async ({ passcode }) => {
      await unlockPrivate(passcode);
      router.replace(next);
      router.refresh();
      return 'leaving';
    },
  });

  return (
    <form onSubmit={form.submit} noValidate>
      <div className={cn(inline ? 'flex flex-wrap items-end gap-2.5' : 'space-y-4')}>
        <Field label={t('auth.unlock.passcode')} className={inline ? 'min-w-52 flex-1' : undefined}>
          <Input
            className='h-12'
            type='password'
            autoComplete='off'
            autoFocus={!inline}
            {...form.field('passcode')}
          />
        </Field>
        <Button type='submit' size='lg' className={inline ? undefined : 'w-full'} loading={form.pending}>
          {inline ? t('auth.unlock.submitShort') : t('auth.unlock.submit')}
        </Button>
      </div>
      {/* Under the whole row, so the button does not move when a message appears. */}
      <FieldError message={form.errors.passcode ?? form.error ?? undefined} />
    </form>
  );
}
