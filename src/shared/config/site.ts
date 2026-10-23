import { DEFAULT_BRANDING, DEFAULT_LOGO_URL, NO_BRAND_COLORS, type BrandingDto } from '@contracts/branding';

/**
 * Name, texts, colours, logo and switches of this installation. The super admin edits them in
 * Dashboard › Branding; until then the SITE_* environment variables and these defaults apply.
 */
export type SiteConfig = BrandingDto;

export const defaultSiteConfig: SiteConfig = {
  ...DEFAULT_BRANDING,
  colors: NO_BRAND_COLORS,
  logoUrl: DEFAULT_LOGO_URL,
  customLogo: false,
  friendsEnabled: true,
};
