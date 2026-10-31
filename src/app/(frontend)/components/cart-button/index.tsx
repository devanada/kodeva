'use client';

import { ShoppingCart } from 'lucide-react';

import Link from 'next/link';

import { Button } from '@/components/ui/button';

import { ROUTES } from '@/utils/constants/routes';
import { useCartStore } from '@/utils/providers/cart/store';

function CartButton() {
  const licenses = useCartStore((state) => state.lines.reduce((total, line) => total + line.quantity, 0));
  const hydrated = useCartStore((state) => state.hydrated);
  const count = hydrated ? licenses : 0;

  return (
    <Button asChild variant='ghost' size='icon-lg' className='relative'>
      <Link href={ROUTES.cart} aria-label={count > 0 ? `Keranjang, ${count} lisensi` : 'Keranjang'}>
        <ShoppingCart />
        {count > 0 && (
          <span className='bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex min-w-5 items-center justify-center rounded-full px-1 text-xs font-semibold'>
            {count}
          </span>
        )}
      </Link>
    </Button>
  );
}

export { CartButton };
