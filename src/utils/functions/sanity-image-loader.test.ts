import { describe, expect, it } from 'vitest';

import sanityImageLoader from './sanity-image-loader';

describe('sanityImageLoader', () => {
  it('asks the Sanity CDN for the requested width, quality and an automatic format', () => {
    const url = new URL(
      sanityImageLoader({ src: 'https://cdn.sanity.io/images/p/production/abc-1200x630.jpg', width: 640, quality: 60 }),
    );

    expect(url.origin + url.pathname).toBe('https://cdn.sanity.io/images/p/production/abc-1200x630.jpg');
    expect(url.searchParams.get('w')).toBe('640');
    expect(url.searchParams.get('q')).toBe('60');
    expect(url.searchParams.get('auto')).toBe('format');
    expect(url.searchParams.get('fit')).toBe('max');
  });

  it('defaults the quality to 75', () => {
    const url = new URL(sanityImageLoader({ src: 'https://cdn.sanity.io/images/p/production/a.png', width: 384 }));

    expect(url.searchParams.get('q')).toBe('75');
  });

  it('leaves images from other hosts untouched', () => {
    expect(sanityImageLoader({ src: '/logo.png', width: 100 })).toBe('/logo.png');
    expect(sanityImageLoader({ src: 'https://example.com/a.jpg', width: 100 })).toBe('https://example.com/a.jpg');
  });
});
