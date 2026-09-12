import { randomBytes } from 'node:crypto';
import type { HeroStyle } from '@contracts/branding';
import type { PasscodeStatusDto } from '@contracts/user';
import { hashPassword, verifyPassword } from '@server/auth/password';
import { sessionSecretFromEnv } from '@server/config';
import { JsonFile } from '@server/lib/json-file';
import { singleton } from '@server/lib/singleton';
import { settingsFile } from '@server/storage/paths';

/** Branding chosen in the dashboard; unset fields fall back to SITE_* variables and the defaults. */
export interface BrandingRecord {
  name?: string;
  organization?: string;
  tagline?: string;
  description?: string;
  heroStyle?: HeroStyle;
  /** Set while an uploaded logo exists (also busts browser caches). */
  logoUpdatedAt?: string | null;
}

/** What is stored in settings.json. */
interface SettingsRecord {
  sessionSecret?: string;
  friendsPasscodeHash?: string;
  friendsPasscodeUpdatedAt?: string | null;
  branding?: BrandingRecord;
}

export interface Settings {
  /** Signs the session cookies. */
  sessionSecret: string;
  /** Null until the first setup has chosen a passcode. */
  friendsPasscodeHash: string | null;
  /** Null while the passcode is one the current team did not choose (kept from an older version). */
  friendsPasscodeUpdatedAt: string | null;
}

const store = singleton(
  'settings-store',
  () => new JsonFile<SettingsRecord>(settingsFile, () => ({}), 0o600),
);

function complete(record: SettingsRecord): Settings | null {
  if (!record.sessionSecret) return null;
  return {
    sessionSecret: sessionSecretFromEnv() ?? record.sessionSecret,
    friendsPasscodeHash: record.friendsPasscodeHash ?? null,
    friendsPasscodeUpdatedAt: record.friendsPasscodeUpdatedAt ?? null,
  };
}

/** Current settings. The random session secret is created and saved on the first call. */
export async function getSettings(): Promise<Settings> {
  const current = complete(await store.read());
  if (current) return current;
  const saved = await store.update((draft) => {
    draft.sessionSecret ??= randomBytes(32).toString('hex');
    return complete(draft);
  });
  if (!saved) throw new Error('Settings could not be initialised.');
  return saved;
}

/** False while no passcode has been set, so nobody can unlock before the setup. */
export async function verifyFriendsPasscode(passcode: string): Promise<boolean> {
  const { friendsPasscodeHash } = await getSettings();
  return friendsPasscodeHash !== null && verifyPassword(passcode, friendsPasscodeHash);
}

/** Replaces the friends passcode. Every friend session ends, because it was bound to the old one. */
export async function setFriendsPasscode(passcode: string): Promise<PasscodeStatusDto> {
  await getSettings();
  const hash = await hashPassword(passcode);
  const updatedAt = new Date().toISOString();
  await store.update((draft) => {
    draft.friendsPasscodeHash = hash;
    draft.friendsPasscodeUpdatedAt = updatedAt;
  });
  return { updatedAt };
}

export async function getPasscodeStatus(): Promise<PasscodeStatusDto> {
  return { updatedAt: (await getSettings()).friendsPasscodeUpdatedAt };
}

export async function getBrandingRecord(): Promise<BrandingRecord> {
  return (await store.read()).branding ?? {};
}

/** Changes the stored branding; returns the new record. */
export async function updateBrandingRecord(
  change: (branding: BrandingRecord) => void,
): Promise<BrandingRecord> {
  await getSettings();
  return store.update((draft) => {
    const branding = { ...(draft.branding ?? {}) };
    change(branding);
    draft.branding = branding;
    return branding;
  });
}
