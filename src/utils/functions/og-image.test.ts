import { describe, expect, it } from 'vitest';

import { ogImageUrl } from './og-image';

describe('ogImageUrl', () => {
  it('asks the Sanity CDN for a 1200x630 cropped, compressed copy', () => {
    const url = new URL(ogImageUrl('https://cdn.sanity.io/images/p/production/abc-4000x3000.jpg'));

    expect(url.origin + url.pathname).toBe('https://cdn.sanity.io/images/p/production/abc-4000x3000.jpg');
    expect(url.searchParams.get('w')).toBe('1200');
    expect(url.searchParams.get('h')).toBe('630');
    expect(url.searchParams.get('fit')).toBe('crop');
    expect(url.searchParams.get('auto')).toBe('format');
    expect(url.searchParams.get('q')).toBe('75');
  });

  it('overrides any size parameters already on the URL', () => {
    const url = new URL(ogImageUrl('https://cdn.sanity.io/images/p/production/a.jpg?w=99&h=99'));

    expect(url.searchParams.get('w')).toBe('1200');
    expect(url.searchParams.get('h')).toBe('630');
  });

  it('leaves other hosts untouched', () => {
    expect(ogImageUrl('https://example.com/cover.jpg')).toBe('https://example.com/cover.jpg');
  });
});
