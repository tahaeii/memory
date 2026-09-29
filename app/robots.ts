import type { MetadataRoute } from 'next';

/** The archive is internal: ask every crawler to stay out (pages also send X-Robots-Tag: noindex). */
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', disallow: '/' } };
}
