interface ImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

// Sanity's image CDN resizes and re-encodes on the fly through query parameters; other sources are returned untouched.
export default function sanityImageLoader({ src, width, quality }: ImageLoaderProps): string {
  if (!src.startsWith('https://cdn.sanity.io/')) {
    return src;
  }

  const url = new URL(src);

  url.searchParams.set('w', String(width));
  url.searchParams.set('q', String(quality ?? 75));
  url.searchParams.set('auto', 'format');
  url.searchParams.set('fit', 'max');

  return url.toString();
}
