import { act, fireEvent, render, screen } from '@testing-library/react';

import { afterEach, describe, expect, it, vi } from 'vitest';

// the real widget would load Cloudflare's script; a stub is enough to know whether the form tried to render it
vi.mock('@marsidev/react-turnstile', () => ({
  Turnstile: ({ siteKey }: { siteKey: string }) => <div data-testid='turnstile' data-sitekey={siteKey} />,
}));

// A controllable IntersectionObserver: jsdom has none, and the form only mounts the captcha once it is near the viewport.
let reportIntersection: (isIntersecting: boolean) => void = () => undefined;

class FakeIntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    reportIntersection = (isIntersecting) =>
      callback([{ isIntersecting } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }

  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

// the site key is read from the environment when the module loads, so each case imports a fresh copy
async function renderLeadForm(siteKey: string | undefined) {
  vi.resetModules();

  if (siteKey === undefined) {
    vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', '');
  } else {
    vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', siteKey);
  }

  const { LeadForm } = await import('./index');

  render(<LeadForm />);
}

describe('LeadForm captcha', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('renders the captcha with the configured site key and enables the submit button', async () => {
    // no IntersectionObserver in this environment: the form falls back to loading the captcha right away
    await renderLeadForm('0x4AAAAAAAreal');

    expect(await screen.findByTestId('turnstile')).toHaveAttribute('data-sitekey', '0x4AAAAAAAreal');
    expect(screen.queryByText('Formulir belum aktif')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Kirim' })).toBeEnabled();
  });

  it('does not load the captcha while the form is far from the viewport, and loads it when it gets close', async () => {
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
    await renderLeadForm('0x4AAAAAAAreal');

    expect(screen.queryByTestId('turnstile')).not.toBeInTheDocument();

    act(() => reportIntersection(false));
    expect(screen.queryByTestId('turnstile')).not.toBeInTheDocument();

    act(() => reportIntersection(true));
    expect(screen.getByTestId('turnstile')).toBeInTheDocument();
  });

  it('loads the captcha as soon as a field is focused, even if the form was never scrolled near', async () => {
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
    await renderLeadForm('0x4AAAAAAAreal');

    expect(screen.queryByTestId('turnstile')).not.toBeInTheDocument();

    fireEvent.focus(screen.getByLabelText('Nama'));

    expect(screen.getByTestId('turnstile')).toBeInTheDocument();
  });

  it('explains that the form is inactive and disables submit when no site key was built in', async () => {
    await renderLeadForm(undefined);

    expect(screen.queryByTestId('turnstile')).not.toBeInTheDocument();
    expect(screen.getByText('Formulir belum aktif')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Kirim' })).toBeDisabled();
  });
});
