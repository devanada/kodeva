import { render, screen } from '@testing-library/react';

import { afterEach, describe, expect, it, vi } from 'vitest';

// the real widget would load Cloudflare's script; a stub is enough to know whether the form tried to render it
vi.mock('@marsidev/react-turnstile', () => ({
  Turnstile: ({ siteKey }: { siteKey: string }) => <div data-testid='turnstile' data-sitekey={siteKey} />,
}));

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
  });

  it('renders the captcha with the configured site key and enables the submit button', async () => {
    await renderLeadForm('0x4AAAAAAAreal');

    expect(screen.getByTestId('turnstile')).toHaveAttribute('data-sitekey', '0x4AAAAAAAreal');
    expect(screen.queryByText('Formulir belum aktif')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Kirim' })).toBeEnabled();
  });

  it('explains that the form is inactive and disables submit when no site key was built in', async () => {
    await renderLeadForm(undefined);

    expect(screen.queryByTestId('turnstile')).not.toBeInTheDocument();
    expect(screen.getByText('Formulir belum aktif')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Kirim' })).toBeDisabled();
  });
});
