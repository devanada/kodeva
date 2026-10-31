'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import Link from 'next/link';

import { zodResolver } from '@hookform/resolvers/zod';

import { InputFormField } from '@/components/form-field/input';
import { SelectFormField } from '@/components/form-field/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';

import { createOrder } from '@/utils/apis/v2/orders';
import { CheckoutForm, CheckoutFormSchema, IOrderResult } from '@/utils/apis/v2/orders/types';
import { ROUTES } from '@/utils/constants/routes';
import { formatIdr } from '@/utils/functions/number';
import { useCartStore } from '@/utils/providers/cart/store';
import { getCartTotals, getUnitPrice } from '@/utils/services/cart';
import { getProductBySlug } from '@/utils/services/products';
import { trackBeginCheckout } from '@/utils/tracking/data-layer';
import { buildPayloadFromLines } from '@/utils/tracking/ecommerce';
import { getUtm } from '@/utils/tracking/utm';

type Stage = { name: 'form' } | { name: 'success'; order: IOrderResult } | { name: 'failed'; message: string };

const PAYMENT_OPTIONS = [
  { value: 'success', label: 'Pembayaran berhasil' },
  { value: 'failure', label: 'Pembayaran gagal' },
];

function CheckoutView() {
  const lines = useCartStore((state) => state.lines);
  const hydrated = useCartStore((state) => state.hydrated);
  const clear = useCartStore((state) => state.clear);
  const [stage, setStage] = useState<Stage>({ name: 'form' });
  const [formError, setFormError] = useState<string | null>(null);
  const beganCheckout = useRef(false);

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(CheckoutFormSchema),
    defaultValues: { name: '', email: '', paymentOutcome: 'success' },
  });

  // begin_checkout fires once per visit to this page, only when there is something to check out
  useEffect(() => {
    if (!hydrated || lines.length === 0 || beganCheckout.current) {
      return;
    }

    beganCheckout.current = true;
    trackBeginCheckout(buildPayloadFromLines(lines));
  }, [hydrated, lines]);

  const onSubmit = async (values: CheckoutForm) => {
    setFormError(null);

    try {
      const response = await createOrder({
        customer: { name: values.name, email: values.email },
        lines,
        utm: getUtm(),
        simulate: values.paymentOutcome,
      });

      if (response.metadata.status_code === 201 && response.data) {
        clear();
        setStage({ name: 'success', order: response.data });

        return;
      }

      if (response.metadata.status_code === 402) {
        setStage({ name: 'failed', message: response.metadata.error ?? 'Pembayaran gagal.' });

        return;
      }

      setFormError(response.metadata.error ?? 'Pesanan tidak dapat diproses.');
    } catch {
      setFormError('Tidak dapat terhubung ke server. Periksa koneksi Anda lalu coba lagi.');
    }
  };

  if (!hydrated) {
    return (
      <div aria-busy='true' className='flex flex-col gap-3'>
        <Skeleton className='h-40 w-full' />
        <Skeleton className='h-40 w-full' />
      </div>
    );
  }

  if (stage.name === 'success') {
    const { order } = stage;

    return (
      <div className='flex flex-col gap-4'>
        <Alert>
          <AlertTitle>Pembayaran berhasil</AlertTitle>
          <AlertDescription>
            Pesanan {order.orderId} atas nama {order.customer.name} sudah kami terima. Lisensi dikirim ke{' '}
            {order.customer.email}.
          </AlertDescription>
        </Alert>
        <Card>
          <CardContent className='flex flex-col gap-2'>
            <h2 className='font-semibold'>Payload pesanan (mock)</h2>
            <pre className='bg-muted max-h-72 overflow-auto rounded-lg p-3 text-xs'>
              {JSON.stringify(order, null, 2)}
            </pre>
          </CardContent>
        </Card>
        <Button asChild size='lg' className='w-fit'>
          <Link href={ROUTES.products}>Kembali ke katalog</Link>
        </Button>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Tidak ada yang bisa di-checkout</EmptyTitle>
          <EmptyDescription>Keranjang Anda kosong.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild size='lg'>
            <Link href={ROUTES.products}>Lihat katalog</Link>
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  const totals = getCartTotals(lines);

  return (
    <div className='grid gap-6 md:grid-cols-[1fr_20rem]'>
      <div className='flex flex-col gap-4'>
        {stage.name === 'failed' && (
          <Alert variant='destructive'>
            <AlertTitle>Pembayaran gagal</AlertTitle>
            <AlertDescription>
              {stage.message} Keranjang Anda masih tersimpan.
              <Button
                type='button'
                variant='outline'
                className='mt-3 min-h-11'
                onClick={() => setStage({ name: 'form' })}
              >
                Coba lagi
              </Button>
            </AlertDescription>
          </Alert>
        )}
        {formError && (
          <Alert variant='destructive'>
            <AlertTitle>Pesanan belum bisa diproses</AlertTitle>
            <AlertDescription>
              {formError}{' '}
              <Link href={ROUTES.cart} className='underline'>
                Periksa keranjang
              </Link>
            </AlertDescription>
          </Alert>
        )}
        {stage.name === 'form' && (
          <form
            onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
            noValidate
            className='flex flex-col gap-4'
          >
            <InputFormField control={form.control} name='name' id='checkout-name' label='Nama' autoComplete='name' />
            <InputFormField
              control={form.control}
              name='email'
              id='checkout-email'
              label='Email'
              type='email'
              autoComplete='email'
              inputMode='email'
              description='Lisensi dikirim ke email ini.'
            />
            <SelectFormField
              control={form.control}
              name='paymentOutcome'
              id='checkout-outcome'
              label='Simulasi hasil pembayaran'
              description='Hanya untuk demo: pilih hasil yang ingin dilihat.'
              options={PAYMENT_OPTIONS}
            />
            <Button type='submit' size='lg' className='min-h-11' disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Spinner />}
              {form.formState.isSubmitting ? 'Memproses pembayaran...' : `Bayar ${formatIdr(totals.subtotal)}`}
            </Button>
          </form>
        )}
      </div>

      <aside className='h-fit md:sticky md:top-20'>
        <Card>
          <CardContent className='flex flex-col gap-3'>
            <h2 className='font-semibold'>Ringkasan pesanan</h2>
            <ul className='flex flex-col gap-2 text-sm'>
              {lines.map((line) => {
                const product = getProductBySlug(line.productSlug);

                if (!product) {
                  return null;
                }

                return (
                  <li key={`${line.productSlug}:${line.planId}`} className='flex justify-between gap-3'>
                    <span>
                      {product.name} ({product.plans.find((plan) => plan.id === line.planId)?.name}) x {line.quantity}
                    </span>
                    <span className='shrink-0'>
                      {formatIdr((getUnitPrice(product, line.planId) ?? 0) * line.quantity)}
                    </span>
                  </li>
                );
              })}
            </ul>
            {totals.savings > 0 && (
              <p className='text-muted-foreground flex justify-between text-sm'>
                <span>Hemat promo</span>
                <span>-{formatIdr(totals.savings)}</span>
              </p>
            )}
            <p className='flex justify-between border-t pt-2 font-semibold'>
              <span>Total / bulan</span>
              <span>{formatIdr(totals.subtotal)}</span>
            </p>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

export { CheckoutView };
