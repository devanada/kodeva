export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

// Link previews (WhatsApp, Facebook, LinkedIn) want about 1200x630 and a small file; WhatsApp skips large images. The
// original upload in the CMS can be several MB, so ask Sanity's image CDN for a cropped, compressed copy. Other hosts are
// returned untouched.
export function ogImageUrl(src: string): string {
  if (!src.startsWith('https://cdn.sanity.io/')) {
    return src;
  }

  const url = new URL(src);

  url.searchParams.set('w', String(OG_IMAGE_WIDTH));
  url.searchParams.set('h', String(OG_IMAGE_HEIGHT));
  url.searchParams.set('fit', 'crop');
  url.searchParams.set('auto', 'format');
  url.searchParams.set('q', '75');

  return url.toString();
}
