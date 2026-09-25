import 'server-only';
import { cache } from 'react';
import { getBranding } from '@server/branding/branding.service';
import type { SiteConfig } from './site';

/** The site's branding, read once per request (dashboard values, then SITE_* variables, then defaults). */
export const getSiteConfig = cache((): Promise<SiteConfig> => getBranding());
