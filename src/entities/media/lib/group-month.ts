import type { MediaDto } from '../model/types';

interface MediaGroup {
  key: string;
  label: string;
  items: MediaDto[];
  /** Index of the first item of this group in the flat list (used by the viewer). */
  start: number;
}

function groupBy(items: MediaDto[], keyOf: (item: MediaDto) => string, labelOf: (item: MediaDto) => string) {
  const groups: MediaGroup[] = [];
  items.forEach((item, index) => {
    const key = keyOf(item);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(item);
    else groups.push({ key, label: labelOf(item), items: [item], start: index });
  });
  return groups;
}

const monthFormat = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });

/** Groups a newest-first list by month ("September 2026"). */
export function groupMediaByMonth(items: MediaDto[]): MediaGroup[] {
  return groupBy(
    items,
    (item) => item.takenAt.slice(0, 7),
    (item) => monthFormat.format(new Date(item.takenAt)),
  );
}
