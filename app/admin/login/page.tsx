import type { Metadata } from 'next';
import { t } from '@i18n';
import { AdminLoginPage } from '@/pages/admin-login';

export const metadata: Metadata = { title: t('auth.login.pageTitle'), robots: { index: false } };

export default AdminLoginPage;
