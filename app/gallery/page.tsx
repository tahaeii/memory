import type { Metadata } from 'next';
import { t } from '@i18n';
import { GalleryPage } from '@/pages/gallery';

export const metadata: Metadata = { title: t('gallery.pageTitle') };

export default GalleryPage;
