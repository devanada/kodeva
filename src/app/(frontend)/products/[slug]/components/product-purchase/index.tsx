'use client';

import { useEffect, useRef, useState } from 'react';

import Link from 'next/link';

import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { PLAN_DESCRIPTIONS } from '@/utils/constants/products';
import { ROUTES } from '@/utils/constants/routes';
import { formatIdr } from '@/utils/functions/number';
import { useCartStore } from '@/utils/providers/cart/store';
import { getRegularPrice, getRemainingQuota, getUnitPrice } from '@/utils/services/cart';
import { IProduct, PlanId } from '@/utils/services/products/types';
import { trackAddToCart, trackViewItem } from '@/utils/tracking/data-layer';
import { buildItem, buildPayload } from '@/utils/tracking/ecommerce';

import { QuantityStepper } from '../../../../components/quantity-stepper';

interface ProductPurchaseProps {
  product: IProduct;
}

function ProductPurchase({ product }: ProductPurchaseProps) {
  const [planId, setPlanId] = useState<PlanId>(product.plans[0].id);
  const [quantity, setQuantity] = useState(1);
  const lines = useCartStore((state) => state.lines);
  const addItem = useCartStore((state) => state.addItem);
  const viewedSlug = useRef<string | null>(null);

  // one view_item per product visit: the ref survives re-renders and the StrictMode double effect
  useEffect(() => {
    if (viewedSlug.current === product.slug) {
      return;
    }

    viewedSlug.current = product.slug;

    const item = buildItem(product, product.plans[0].id, 1);

    if (item) {
      trackViewItem(buildPayload([item]));
    }
  }, [product]);

  const unitPrice = getUnitPrice(product, planId) ?? 0;
  const regularPrice = getRegularPrice(product, planId) ?? 0;
  const remaining = getRemainingQuota(product, lines);
  const soldOut = remaining === 0;
  const effectiveQuantity = Math.min(quantity, Math.max(1, remaining));

  const handleAddToCart = () => {
    const added = addItem(product.slug, planId, effectiveQuantity);

    if (added === 0) {
      toast.error('Kuota promo sudah habis untuk produk ini.');

      return;
    }

    const item = buildItem(product, planId, added);

    if (item) {
      trackAddToCart(buildPayload([item]));
    }

    if (added < effectiveQuantity) {
      toast.warning(`Hanya ${added} lisensi yang ditambahkan, itu sisa kuota promo.`);
    } else {
      toast.success(`${added} lisensi ${product.name} masuk keranjang.`, {
        action: { label: 'Lihat keranjang', onClick: () => (window.location.href = ROUTES.cart) },
      });
    }

    setQuantity(1);
  };

  return (
    <div className='flex flex-col gap-6'>
      <RadioGroup
        value={planId}
        onValueChange={(value) => setPlanId(value as PlanId)}
        aria-label='Pilih paket'
        className='grid gap-3 sm:grid-cols-3'
      >
        {product.plans.map((plan) => (
          <Label
            key={plan.id}
            htmlFor={`plan-${plan.id}`}
            className='has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5 flex min-h-11 cursor-pointer flex-col items-start gap-1 rounded-xl border p-3'
          >
            <span className='flex w-full items-center justify-between'>
              <span className='font-semibold'>{plan.name}</span>
              <RadioGroupItem id={`plan-${plan.id}`} value={plan.id} />
            </span>
            <span className='text-muted-foreground text-xs font-normal'>{PLAN_DESCRIPTIONS[plan.id]}</span>
            <span className='text-sm font-medium'>
              {formatIdr(getUnitPrice(product, plan.id) ?? plan.price)}
              <span className='text-muted-foreground text-xs font-normal'>/lisensi/bulan</span>
            </span>
          </Label>
        ))}
      </RadioGroup>

      <div className='flex flex-wrap items-baseline gap-x-3 gap-y-1'>
        <p className='text-3xl font-bold' aria-live='polite'>
          {formatIdr(unitPrice)}
        </p>
        {product.promo && (
          <>
            <p className='text-muted-foreground text-lg line-through'>{formatIdr(regularPrice)}</p>
            <Badge>Hemat {product.promo.discountPercent}%</Badge>
          </>
        )}
        <p className='text-muted-foreground text-sm'>per lisensi / bulan</p>
      </div>

      {product.promo && (
        <p className='text-sm font-medium' aria-live='polite'>
          {soldOut ? 'Seluruh kuota promo sudah ada di keranjang Anda.' : `Sisa kuota promo: ${remaining} lisensi`}
        </p>
      )}

      <div className='flex flex-wrap items-center gap-4'>
        <QuantityStepper
          label='Jumlah lisensi (user atau outlet)'
          value={effectiveQuantity}
          max={Math.max(1, remaining)}
          onChange={setQuantity}
        />
        <Button size='lg' className='min-h-11 flex-1 sm:flex-none' disabled={soldOut} onClick={handleAddToCart}>
          {soldOut ? 'Kuota habis' : 'Tambah ke keranjang'}
        </Button>
      </div>

      {soldOut && (
        <Link href={ROUTES.cart} className='text-primary text-sm font-medium'>
          Lihat keranjang
        </Link>
      )}
    </div>
  );
}

export { ProductPurchase };
