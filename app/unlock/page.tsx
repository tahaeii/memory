import type { Metadata } from 'next';
import { t } from '@i18n';
import { UnlockPage } from '@/pages/unlock';

export const metadata: Metadata = { title: t('auth.unlock.pageTitle'), robots: { index: false } };

export default UnlockPage;
