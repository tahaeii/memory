import type { Metadata } from 'next';
import { t } from '@i18n';
import { SetupPage } from '@/pages/setup';

export const metadata: Metadata = { title: t('setup.pageTitle'), robots: { index: false } };

export default SetupPage;
