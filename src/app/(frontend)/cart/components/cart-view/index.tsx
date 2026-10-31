'use client';

import { Trash2 } from 'lucide-react';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';

import { ROUTES } from '@/utils/constants/routes';
import { formatIdr } from '@/utils/functions/number';
import { useCartStore } from '@/utils/providers/cart/store';
import { getCartTotals, getRegularPrice, getRemainingQuota, getUnitPrice } from '@/utils/services/cart';
import { getProductBySlug } from '@/utils/services/products';

import { QuantityStepper } from '../../../components/quantity-stepper';

function CartView() {
  const lines = useCartStore((state) => state.lines);
  const hydrated = useCartStore((state) => state.hydrated);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  if (!hydrated) {
    return (
      <div className='flex flex-col gap-3' aria-busy='true'>
        <Skeleton className='h-28 w-full' />
        <Skeleton className='h-28 w-full' />
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Keranjang masih kosong</EmptyTitle>
          <EmptyDescription>Pilih aplikasi dan paket yang Anda butuhkan terlebih dahulu.</EmptyDescription>
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
      <ul className='flex flex-col gap-3'>
        {lines.map((line) => {
          const product = getProductBySlug(line.productSlug);

          if (!product) {
            return null;
          }

          const unit = getUnitPrice(product, line.planId) ?? 0;
          const regular = getRegularPrice(product, line.planId) ?? 0;
          const max = Math.max(line.quantity, getRemainingQuota(product, lines, line));
          const planName = product.plans.find((plan) => plan.id === line.planId)?.name;

          return (
            <li key={`${line.productSlug}:${line.planId}`}>
              <Card>
                <CardContent className='flex flex-col gap-3'>
                  <div className='flex items-start justify-between gap-3'>
                    <div>
                      <Link href={`${ROUTES.products}/${product.slug}`} className='font-semibold hover:underline'>
                        {product.name}
                      </Link>
                      <p className='text-muted-foreground text-sm'>Paket {planName}</p>
                      <p className='text-sm'>
                        {product.promo && regular > unit && (
                          <span className='text-muted-foreground mr-2 line-through'>{formatIdr(regular)}</span>
                        )}
                        <span className='font-medium'>{formatIdr(unit)}</span>
                        <span className='text-muted-foreground'> /lisensi/bulan</span>
                      </p>
                    </div>
                    <Button
                      type='button'
                      variant='ghost'
                      className='size-11'
                      aria-label={`Hapus ${product.name} paket ${planName}`}
                      onClick={() => removeItem(line.productSlug, line.planId)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                  <div className='flex flex-wrap items-center justify-between gap-3'>
                    <QuantityStepper
                      label={`Jumlah lisensi ${product.name} paket ${planName}`}
                      value={line.quantity}
                      max={max}
                      onChange={(value) => setQuantity(line.productSlug, line.planId, value)}
                    />
                    <p className='font-semibold'>{formatIdr(unit * line.quantity)}</p>
                  </div>
                  {product.promo && line.quantity >= max && (
                    <p className='text-muted-foreground text-xs'>
                      Batas kuota promo tercapai ({product.promo.quota} lisensi untuk semua paket {product.name}).
                    </p>
                  )}
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>

      <aside className='h-fit md:sticky md:top-20'>
        <Card>
          <CardContent className='flex flex-col gap-3'>
            <h2 className='font-semibold'>Ringkasan</h2>
            <dl className='flex flex-col gap-1 text-sm'>
              <div className='flex justify-between'>
                <dt className='text-muted-foreground'>Total lisensi</dt>
                <dd>{totals.licenses}</dd>
              </div>
              {totals.savings > 0 && (
                <div className='flex justify-between'>
                  <dt className='text-muted-foreground'>Harga normal</dt>
                  <dd className='line-through'>{formatIdr(totals.original)}</dd>
                </div>
              )}
              {totals.savings > 0 && (
                <div className='flex justify-between'>
                  <dt className='text-muted-foreground'>Hemat promo</dt>
                  <dd>-{formatIdr(totals.savings)}</dd>
                </div>
              )}
              <div className='mt-1 flex justify-between border-t pt-2 text-base font-semibold'>
                <dt>Subtotal / bulan</dt>
                <dd>{formatIdr(totals.subtotal)}</dd>
              </div>
            </dl>
            <Button asChild size='lg' className='min-h-11'>
              <Link href={ROUTES.checkout}>Lanjut ke checkout</Link>
            </Button>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

export { CartView };
