import type { Metadata } from 'next';

import { CartView } from './components/cart-view';

export const metadata: Metadata = {
  title: 'Keranjang',
  robots: { index: false, follow: false },
};

function CartPage() {
  return (
    <main className='mx-auto w-full max-w-5xl flex-1 px-4 py-10'>
      <h1 className='mb-6 text-3xl font-bold tracking-tight'>Keranjang</h1>
      <CartView />
    </main>
  );
}

export default CartPage;
