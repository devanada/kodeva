import { beforeEach, describe, expect, it } from 'vitest';

import { captureUtm, getUtm, parseUtm } from './utm';

describe('parseUtm', () => {
  it('reads only utm_* parameters', () => {
    expect(parseUtm('?utm_source=instagram&utm_campaign=akhir-tahun&page=2')).toEqual({
      source: 'instagram',
      campaign: 'akhir-tahun',
    });
  });

  it('ignores blank values and truncates long ones', () => {
    const long = 'x'.repeat(300);

    expect(parseUtm(`?utm_source=%20&utm_term=${long}`)).toEqual({ term: 'x'.repeat(100) });
  });
});

describe('captureUtm', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('keeps attribution after the visitor navigates to a page without utm parameters', () => {
    captureUtm('?utm_source=tiktok&utm_medium=social');

    expect(captureUtm('')).toEqual({ source: 'tiktok', medium: 'social' });
    expect(getUtm()).toEqual({ source: 'tiktok', medium: 'social' });
  });

  it('replaces the stored attribution when a new campaign link is opened', () => {
    captureUtm('?utm_source=tiktok&utm_campaign=a');
    captureUtm('?utm_source=instagram');

    expect(getUtm()).toEqual({ source: 'instagram' });
  });

  it('returns an empty object when nothing was ever captured', () => {
    expect(captureUtm('')).toEqual({});
  });
});
