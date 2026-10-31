import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from '../functions/og-image';

const DEFAULT_SITE_URL = 'http://localhost:3000';

// NEXT_PUBLIC_SITE_URL is typed by hand in a dashboard, so it may end with one or more slashes. Paths are appended with a
// leading slash, so a trailing one would produce `https://example.com//products` in the sitemap.
export function normalizeSiteUrl(value: string | undefined): string {
  const trimmed = (value ?? '').trim();

  return (trimmed || DEFAULT_SITE_URL).replace(/\/+$/, '');
}

export const SITE_URL = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

// The image shown when a link is shared on WhatsApp, Facebook or LinkedIn: public/og-default.png, 1200x630, under 50 KB
// (WhatsApp skips large images). A page that defines its own `openGraph` replaces the parent's entirely, images
// included, so every page that does so sets this explicitly (an article with a cover uses the cover instead).
export const DEFAULT_OG_IMAGE = {
  url: '/og-default.png',
  width: OG_IMAGE_WIDTH,
  height: OG_IMAGE_HEIGHT,
  alt: 'Kodeva: Promo Akhir Tahun, aplikasi kasir dan HR & payroll untuk UMKM',
};
