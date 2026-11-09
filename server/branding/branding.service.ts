import { promises as fs } from 'node:fs';
import sharp from 'sharp';
import { t } from '@i18n';
import {
  DEFAULT_BRANDING,
  DEFAULT_LOGO_URL,
  isHeroStyle,
  type BrandingDto,
  type BrandingInput,
} from '@contracts/branding';
import { friendsEnabled } from '@server/config';
import { HttpError } from '@server/lib/errors';
import { getBrandingRecord, updateBrandingRecord } from '@server/settings/settings.service';
import { brandingDir, logoPath } from '@server/storage/paths';

/** Logos are stored as a PNG of at most this many pixels per side. */
const LOGO_SIZE = 512;
export const MAX_LOGO_BYTES = 5 * 1024 * 1024;
const LOGO_FORMATS = new Set(['png', 'jpeg', 'webp', 'avif', 'gif', 'tiff']);

const env = (name: string): string | undefined => process.env[name]?.trim() || undefined;
const pick = (...values: Array<string | undefined>): string =>
  values.find((value) => value && value.trim()) ?? '';

const HEX_COLOR = /^#[0-9a-f]{6}$/i;
/** The first value that is a `#rrggbb` colour. Anything else (a typo in .env, an edited file) is skipped. */
const pickColor = (...values: Array<string | undefined>): string | null =>
  values.find((value) => value && HEX_COLOR.test(value))?.toLowerCase() ?? null;

/**
 * The branding visitors see: what the super admin set in the dashboard, else the SITE_* environment
 * variables, else the built-in defaults.
 */
export async function getBranding(): Promise<BrandingDto> {
  const saved = await getBrandingRecord();
  return {
    name: pick(saved.name, env('SITE_NAME'), DEFAULT_BRANDING.name),
    organization: pick(saved.organization, env('SITE_ORGANIZATION'), DEFAULT_BRANDING.organization),
    tagline: pick(saved.tagline, env('SITE_TAGLINE'), DEFAULT_BRANDING.tagline),
    description: pick(saved.description, env('SITE_DESCRIPTION'), DEFAULT_BRANDING.description),
    heroStyle: isHeroStyle(saved.heroStyle) ? saved.heroStyle : DEFAULT_BRANDING.heroStyle,
    colors: {
      primary: pickColor(saved.primaryColor, env('BRAND_PRIMARY_COLOR')),
      secondary: pickColor(saved.secondaryColor, env('BRAND_SECONDARY_COLOR')),
    },
    logoUrl: saved.logoUpdatedAt
      ? '/api/branding/logo?v=' + Date.parse(saved.logoUpdatedAt).toString(36)
      : DEFAULT_LOGO_URL,
    customLogo: Boolean(saved.logoUpdatedAt),
    friendsEnabled: friendsEnabled(),
  };
}

/** Saves the texts, the colours and the home page style. Empty texts and colours go back to the defaults. */
export async function updateBranding(input: BrandingInput): Promise<BrandingDto> {
  await updateBrandingRecord((branding) => {
    branding.name = input.name.trim() || undefined;
    branding.organization = input.organization.trim() || undefined;
    branding.tagline = input.tagline.trim() || undefined;
    branding.description = input.description.trim() || undefined;
    branding.heroStyle = input.heroStyle;
    branding.primaryColor = input.colors.primary ?? undefined;
    branding.secondaryColor = input.colors.secondary ?? undefined;
  });
  return getBranding();
}

/**
 * Replaces the logo with an uploaded image. Whatever was uploaded is decoded and re-encoded as a
 * plain PNG (no SVG, no scripts, no metadata), so the stored file is always a harmless image.
 */
export async function saveLogo(bytes: Buffer): Promise<BrandingDto> {
  if (bytes.length === 0) throw new HttpError(400, t('errors.logo.missing'));
  if (bytes.length > MAX_LOGO_BYTES) throw new HttpError(413, t('errors.logo.tooLarge'));
  let format: string | undefined;
  try {
    format = (await sharp(bytes, { limitInputPixels: 40_000_000 }).metadata()).format;
  } catch {
    format = undefined;
  }
  if (!format || !LOGO_FORMATS.has(format)) throw new HttpError(415, t('errors.logo.format'));

  const png = await sharp(bytes, { limitInputPixels: 40_000_000, animated: false })
    .rotate()
    .resize(LOGO_SIZE, LOGO_SIZE, { fit: 'inside', withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toBuffer();
  await fs.mkdir(brandingDir(), { recursive: true });
  const target = logoPath();
  await fs.writeFile(target + '.tmp', png, { mode: 0o644 });
  await fs.rename(target + '.tmp', target);
  await updateBrandingRecord((branding) => {
    branding.logoUpdatedAt = new Date().toISOString();
  });
  return getBranding();
}

/** Goes back to the bundled logo. */
export async function removeLogo(): Promise<BrandingDto> {
  await fs.rm(logoPath(), { force: true });
  await updateBrandingRecord((branding) => {
    branding.logoUpdatedAt = null;
  });
  return getBranding();
}

/** The uploaded logo, or null when there is none. */
export async function readLogo(): Promise<Buffer | null> {
  if (!(await getBrandingRecord()).logoUpdatedAt) return null;
  return fs.readFile(logoPath()).catch(() => null);
}
