import type { Metadata } from 'next';
import { t } from '@i18n';
import { AdminPage } from '@/pages/admin';

export const metadata: Metadata = { title: t('admin.pageTitle'), robots: { index: false } };

export default AdminPage;
