import { DEFAULT_BRANDING, DEFAULT_LOGO_URL, type BrandingDto } from '@contracts/branding';

/**
 * Name, texts, logo and switches of this installation. The super admin edits them in
 * Dashboard › Branding; until then the SITE_* environment variables and these defaults apply.
 */
export type SiteConfig = BrandingDto;

export const defaultSiteConfig: SiteConfig = {
  ...DEFAULT_BRANDING,
  logoUrl: DEFAULT_LOGO_URL,
  customLogo: false,
  friendsEnabled: true,
};
