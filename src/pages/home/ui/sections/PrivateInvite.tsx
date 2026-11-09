import { t } from '@i18n';
import { UnlockForm } from '@/features/unlock-private';

/** Tells visitors there is more behind the passcode, with the field right there. */
export function PrivateInvite() {
  return (
    <div className='border-line bg-surface relative isolate flex flex-col gap-6 overflow-hidden rounded-2xl border p-6 sm:p-9 lg:flex-row lg:items-center lg:gap-12'>
      <div aria-hidden className='pattern-halftone text-line-strong absolute inset-0 -z-10' />
      <div className='lg:flex-1'>
        <h2 className='type-section'>{t('home.invite.title')}</h2>
        <p className='text-muted mt-2 max-w-md text-pretty'>{t('home.invite.text')}</p>
      </div>
      <div className='lg:flex-1'>
        <UnlockForm next='/' layout='inline' />
      </div>
    </div>
  );
}
