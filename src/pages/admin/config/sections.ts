import {
  CalendarDays,
  Images,
  Palette,
  Settings,
  Trash2,
  Upload,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { t } from '@i18n';

/** The dashboard sections, in menu order. The id is also the address fragment (/admin#upload). */
export const SECTIONS = [
  { id: 'library', label: t('admin.sections.library.label'), icon: Images, superAdminOnly: false },
  { id: 'upload', label: t('admin.sections.upload.label'), icon: Upload, superAdminOnly: false },
  { id: 'events', label: t('admin.sections.events.label'), icon: CalendarDays, superAdminOnly: false },
  { id: 'deleted', label: t('admin.sections.deleted.label'), icon: Trash2, superAdminOnly: true },
  { id: 'admins', label: t('admin.sections.admins.label'), icon: Users, superAdminOnly: true },
  { id: 'branding', label: t('admin.sections.branding.label'), icon: Palette, superAdminOnly: true },
  { id: 'settings', label: t('admin.sections.settings.label'), icon: Settings, superAdminOnly: false },
] as const satisfies ReadonlyArray<{ id: string; label: string; icon: LucideIcon; superAdminOnly: boolean }>;

export type SectionId = (typeof SECTIONS)[number]['id'];

export function isSectionId(value: string): value is SectionId {
  return SECTIONS.some((section) => section.id === value);
}

/** The sections this account may open. */
export function sectionsFor(isSuperAdmin: boolean) {
  return SECTIONS.filter((section) => isSuperAdmin || !section.superAdminOnly);
}
