import type { Metadata } from 'next';
import { t } from '@i18n';
import { EventsPage } from '@/pages/events';

export const metadata: Metadata = { title: t('events.pageTitle') };

export default EventsPage;
