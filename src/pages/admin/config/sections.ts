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

/** The dashboard sections, in menu order. The id is also the address fragment (/admin#upload). */
export const SECTIONS = [
  { id: 'library', label: 'Library', icon: Images, superAdminOnly: false },
  { id: 'upload', label: 'Upload', icon: Upload, superAdminOnly: false },
  { id: 'events', label: 'Events', icon: CalendarDays, superAdminOnly: false },
  { id: 'deleted', label: 'Deleted', icon: Trash2, superAdminOnly: true },
  { id: 'admins', label: 'Admins', icon: Users, superAdminOnly: true },
  { id: 'branding', label: 'Branding', icon: Palette, superAdminOnly: true },
  { id: 'settings', label: 'Settings', icon: Settings, superAdminOnly: false },
] as const satisfies ReadonlyArray<{ id: string; label: string; icon: LucideIcon; superAdminOnly: boolean }>;

export type SectionId = (typeof SECTIONS)[number]['id'];

export function isSectionId(value: string): value is SectionId {
  return SECTIONS.some((section) => section.id === value);
}

/** The sections this account may open. */
export function sectionsFor(isSuperAdmin: boolean) {
  return SECTIONS.filter((section) => isSuperAdmin || !section.superAdminOnly);
}
