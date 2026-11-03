/** How the home page opens (chosen in Dashboard › Branding). */
export const HERO_STYLES = ['minimal', 'wall', 'filmstrip', 'mosaic'] as const;
export type HeroStyle = (typeof HERO_STYLES)[number];

export function isHeroStyle(value: unknown): value is HeroStyle {
  return typeof value === 'string' && (HERO_STYLES as readonly string[]).includes(value);
}

/**
 * The organisation's own colours as `#rrggbb`. `null` keeps the built-in colour. Every shade the
 * interface needs is derived from these two (see src/shared/lib/brand-theme).
 */
export interface BrandColors {
  /** Buttons, links, selected states and focus rings. */
  primary: string | null;
  /** Badges and small highlights. */
  secondary: string | null;
}

export const NO_BRAND_COLORS: BrandColors = { primary: null, secondary: null };

/** Everything that identifies the organisation running this copy of the app. */
export interface BrandingDto {
  /** Product name in the header, the browser tab and the home page heading. */
  name: string;
  /** Who owns the photos (footer, home page). */
  organization: string;
  /** Small line above the home page heading. */
  tagline: string;
  /** Text under the home page heading. */
  description: string;
  heroStyle: HeroStyle;
  colors: BrandColors;
  /** Logo address: the uploaded logo, or the bundled default. */
  logoUrl: string;
  /** True when an admin uploaded a logo. */
  customLogo: boolean;
  /** Whether the friends area (shared passcode for private items) is switched on for this server. */
  friendsEnabled: boolean;
}

/** What the super admin edits in Dashboard › Branding. Empty texts fall back to the defaults. */
export interface BrandingInput {
  name: string;
  organization: string;
  tagline: string;
  description: string;
  heroStyle: HeroStyle;
  colors: BrandColors;
}

export const DEFAULT_LOGO_URL = '/icon.svg';

export const DEFAULT_BRANDING = {
  name: 'Memory',
  organization: 'Your organisation',
  tagline: 'Photo and video archive',
  description:
    'Celebrations, gatherings and everyday life at the company, organised by date and event and kept in one place.',
  heroStyle: 'minimal' as HeroStyle,
};

export const BRANDING_LIMITS = { name: 60, organization: 80, tagline: 120, description: 300 } as const;
