import { describe, expect, it } from 'vitest';

import { LeadSchema } from './types';

const base = { name: 'Budi Santoso', turnstileToken: 'token' };

describe('LeadSchema', () => {
  it('accepts a lead with only an email', () => {
    expect(LeadSchema.safeParse({ ...base, email: 'budi@example.com' }).success).toBe(true);
  });

  it('accepts a lead with only an Indonesian WhatsApp number', () => {
    expect(LeadSchema.safeParse({ ...base, whatsapp: '0812-3456-7890' }).success).toBe(true);
  });

  it('rejects a lead without any contact', () => {
    const result = LeadSchema.safeParse({ ...base, email: '', whatsapp: '' });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('Isi email atau nomor WhatsApp');
  });

  it('rejects an invalid WhatsApp number', () => {
    expect(LeadSchema.safeParse({ ...base, whatsapp: '123' }).success).toBe(false);
  });

  it('rejects an invalid email', () => {
    expect(LeadSchema.safeParse({ ...base, email: 'not-an-email' }).success).toBe(false);
  });

  it('requires the captcha token', () => {
    expect(LeadSchema.safeParse({ name: 'Budi Santoso', email: 'budi@example.com', turnstileToken: '' }).success).toBe(
      false,
    );
  });

  it('rejects a filled honeypot', () => {
    expect(LeadSchema.safeParse({ ...base, email: 'budi@example.com', website: 'http://spam' }).success).toBe(false);
  });
});
