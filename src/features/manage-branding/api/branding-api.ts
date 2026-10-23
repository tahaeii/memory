import type { BrandingDto, BrandingInput } from '@contracts/branding';
import { apiFetch } from '@/shared/api/http';

export const saveBranding = (input: BrandingInput) =>
  apiFetch<BrandingDto>('/branding', { method: 'PUT', json: input });
export const uploadLogo = (file: File) => apiFetch<BrandingDto>('/branding/logo', { method: 'PUT', file });
export const deleteLogo = () => apiFetch<BrandingDto>('/branding/logo', { method: 'DELETE' });
