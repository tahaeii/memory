'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { BrandingDto, BrandingInput } from '@contracts/branding';
import { useSite } from '@/shared/config/site-context';
import { messageOf } from '@/shared/lib/error-message';
import { deleteLogo, saveBranding, uploadLogo } from '../api/branding-api';

/** Which part of the form a request or a message belongs to. */
type Part = 'details' | 'logo';

export interface BrandingMessage {
  part: Part;
  tone: 'success' | 'error';
  text: string;
}

const toDraft = (branding: BrandingDto): BrandingInput => ({
  name: branding.name,
  organization: branding.organization,
  tagline: branding.tagline,
  description: branding.description,
  heroStyle: branding.heroStyle,
  colors: { ...branding.colors },
});

const sameDraft = (a: BrandingInput, b: BrandingInput): boolean =>
  a.name === b.name &&
  a.organization === b.organization &&
  a.tagline === b.tagline &&
  a.description === b.description &&
  a.heroStyle === b.heroStyle &&
  a.colors.primary === b.colors.primary &&
  a.colors.secondary === b.colors.secondary;

/**
 * Everything the branding form does: the unsaved draft, saving it, and replacing or removing the
 * logo (which is saved at once, on its own). The components that use it only draw.
 */
export function useBrandingForm() {
  const router = useRouter();
  const site = useSite();
  const [saved, setSaved] = useState(() => toDraft(site));
  const [draft, setDraft] = useState(saved);
  const [logo, setLogo] = useState({ url: site.logoUrl, custom: site.customLogo });
  const [pending, setPending] = useState<Part | null>(null);
  const [message, setMessage] = useState<BrandingMessage | null>(null);

  const change = useCallback(
    <K extends keyof BrandingInput>(key: K, value: BrandingInput[K]) =>
      setDraft((current) => ({ ...current, [key]: value })),
    [],
  );

  const attempt = async (part: Part, request: () => Promise<BrandingDto>, done: string) => {
    setPending(part);
    setMessage(null);
    try {
      const branding = await request();
      setLogo({ url: branding.logoUrl, custom: branding.customLogo });
      if (part === 'details') {
        // The server trims the texts and fills empty ones with the defaults.
        setSaved(toDraft(branding));
        setDraft(toDraft(branding));
      }
      setMessage({ part, tone: 'success', text: done });
      // Header, footer and colours are drawn on the server: ask for them again.
      router.refresh();
    } catch (caught) {
      setMessage({ part, tone: 'error', text: messageOf(caught) });
    } finally {
      setPending(null);
    }
  };

  return {
    draft,
    change,
    /** True while the draft differs from what is saved. */
    dirty: !sameDraft(draft, saved),
    discard: () => setDraft(saved),
    logo,
    pending,
    message,
    dismissMessage: () => setMessage(null),
    save: () =>
      attempt('details', () => saveBranding(draft), 'Saved. Every visitor sees the new branding now.'),
    replaceLogo: (file: File) => attempt('logo', () => uploadLogo(file), 'Logo updated.'),
    removeLogo: () => attempt('logo', deleteLogo, 'Back to the default logo.'),
  };
}

export type BrandingForm = ReturnType<typeof useBrandingForm>;
