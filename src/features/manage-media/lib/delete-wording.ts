import type { Role } from '@/entities/session';

/**
 * What the delete confirmation says. The super admin's delete is final; an admin is told the items
 * are deleted (they disappear for everyone), while they actually wait for the super admin's review.
 */
export function deleteWording(role: Role, count: number, noun = 'item') {
  const what = count === 1 ? 'this ' + noun : count + ' ' + noun + 's';
  return role === 'superadmin'
    ? {
        title: 'Delete ' + what + ' for good?',
        body: 'The original and every converted copy are removed from the server. This cannot be undone.',
        confirm: 'Delete for good',
      }
    : {
        title: 'Delete ' + what + '?',
        body: 'Deleted items are removed from the gallery and the library.',
        confirm: 'Delete',
      };
}
