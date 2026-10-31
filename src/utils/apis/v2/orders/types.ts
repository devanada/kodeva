import { z } from 'zod';

// relative imports: the Cloudflare Pages Functions bundle these files without the `@/` alias
import type { ICartLine, ICartTotals } from '../../../services/cart/types';
import type { IUtm } from '../../../tracking/utm';
import { UtmSchema } from '../../../tracking/utm-schema';

export const CustomerSchema = z.object({
  name: z.string().trim().min(2, 'Nama minimal 2 karakter').max(100),
  email: z.email('Format email tidak valid'),
});

export const PaymentOutcomeSchema = z.enum(['success', 'failure']);

export const CheckoutFormSchema = CustomerSchema.extend({
  paymentOutcome: PaymentOutcomeSchema,
});

export type CheckoutForm = z.infer<typeof CheckoutFormSchema>;

export const OrderSchema = z.object({
  customer: CustomerSchema,
  lines: z
    .array(
      z.object({
        productSlug: z.string().max(100),
        planId: z.enum(['basic', 'pro', 'business']),
        quantity: z.number().int().min(1).max(100),
      }),
    )
    .min(1, 'Keranjang kosong')
    .max(30),
  utm: UtmSchema.optional(),
  // only exists so the demo can show both payment outcomes
  simulate: PaymentOutcomeSchema.default('success'),
});

export type OrderInput = z.input<typeof OrderSchema>;

export interface IOrderResult {
  orderId: string;
  status: 'paid';
  customer: z.infer<typeof CustomerSchema>;
  lines: ICartLine[];
  totals: ICartTotals;
  utm: IUtm;
  paidAt: string;
}
