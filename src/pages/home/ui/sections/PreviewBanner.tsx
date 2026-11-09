import Link from 'next/link';
import { t } from '@i18n';
import { rich } from '@i18n/rich';
import type { HeroStyle } from '@contracts/branding';

/** Shown to staff who opened the home page from Dashboard › Branding to try a style. */
export function PreviewBanner({ preview, current }: { preview: HeroStyle; current: HeroStyle }) {
  return (
    <div className='animate-rise-in bg-fg text-canvas shadow-overlay fixed inset-x-3 bottom-4 z-50 mx-auto flex w-fit max-w-full items-center gap-3 rounded-xl py-2 pr-2 pl-4 text-sm'>
      <span className='min-w-0'>
        {rich(
          'home.preview.text',
          { b: (text) => <strong>{text}</strong> },
          { preview: t(`branding.styles.${preview}.title`), current: t(`branding.styles.${current}.title`) },
        )}
      </span>
      <Link
        href='/admin#branding'
        className='bg-canvas/15 hover:bg-canvas/25 shrink-0 rounded-lg px-3 py-1.5 font-semibold whitespace-nowrap transition-colors'>
        {t('home.preview.back')}
      </Link>
    </div>
  );
}
