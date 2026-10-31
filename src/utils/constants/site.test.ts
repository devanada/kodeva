import { describe, expect, it } from 'vitest';

import { normalizeSiteUrl } from './site';

describe('normalizeSiteUrl', () => {
  it('removes trailing slashes so appended paths do not double them', () => {
    expect(normalizeSiteUrl('https://kodeva.devanada.com/')).toBe('https://kodeva.devanada.com');
    expect(normalizeSiteUrl('https://kodeva.devanada.com///')).toBe('https://kodeva.devanada.com');
  });

  it('leaves a clean URL alone and keeps a path prefix', () => {
    expect(normalizeSiteUrl('https://kodeva.pages.dev')).toBe('https://kodeva.pages.dev');
    expect(normalizeSiteUrl('https://example.com/id/')).toBe('https://example.com/id');
  });

  it('trims whitespace from a pasted value', () => {
    expect(normalizeSiteUrl('  https://kodeva.pages.dev/ \n')).toBe('https://kodeva.pages.dev');
  });

  it('falls back to localhost when unset or blank', () => {
    expect(normalizeSiteUrl(undefined)).toBe('http://localhost:3000');
    expect(normalizeSiteUrl('   ')).toBe('http://localhost:3000');
  });
});
