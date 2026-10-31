import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { z } from 'zod';

// relative import: the Cloudflare Pages Functions bundle this file without the `@/` alias
import { UtmSchema } from '../../../tracking/utm-schema';

export const LeadSchema = z
  .object({
    name: z.string().trim().min(2, 'Nama minimal 2 karakter').max(100),
    email: z.union([z.literal(''), z.email('Format email tidak valid')]).optional(),
    whatsapp: z
      .string()
      .trim()
      .optional()
      .transform((value) => value ?? '')
      .refine((value) => value === '' || parsePhoneNumberFromString(value, 'ID')?.isValid(), {
        message: 'Nomor WhatsApp tidak valid',
      }),
    // honeypot: real users never see or fill this field
    website: z.string().max(0).optional(),
    turnstileToken: z.string().min(1, 'Selesaikan verifikasi terlebih dahulu'),
    utm: UtmSchema.optional(),
    landingPath: z.string().max(200).optional(),
  })
  .refine((value) => Boolean(value.email) || Boolean(value.whatsapp), {
    message: 'Isi email atau nomor WhatsApp',
    path: ['email'],
  });

export type LeadInput = z.input<typeof LeadSchema>;
export type LeadPayload = z.output<typeof LeadSchema>;
