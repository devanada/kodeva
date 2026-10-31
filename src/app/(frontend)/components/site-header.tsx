import Link from 'next/link';

import { ROUTES } from '@/utils/constants/routes';

import { CartButton } from './cart-button';

function SiteHeader() {
  return (
    <header className='bg-background/90 sticky top-0 z-40 border-b backdrop-blur'>
      <div className='mx-auto flex h-14 max-w-5xl items-center justify-between px-4'>
        <Link href={ROUTES.home} className='inline-flex min-h-11 items-center text-lg font-semibold tracking-tight'>
          Kodeva
        </Link>
        <nav className='flex items-center gap-2 text-sm font-medium sm:gap-4'>
          <Link href={ROUTES.products} className='hover:text-primary px-2 py-3'>
            Produk
          </Link>
          <Link href={ROUTES.blog} className='hover:text-primary px-2 py-3'>
            Blog
          </Link>
          <CartButton />
        </nav>
      </div>
    </header>
  );
}

export { SiteHeader };
