'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { defaultSiteConfig, type SiteConfig } from './site';

const SiteContext = createContext<SiteConfig>(defaultSiteConfig);

/** Makes the site texts (read from the environment on the server) available to client components. */
export function SiteProvider({ site, children }: { site: SiteConfig; children: ReactNode }) {
  return <SiteContext.Provider value={site}>{children}</SiteContext.Provider>;
}

export function useSite(): SiteConfig {
  return useContext(SiteContext);
}
