import type { Metadata } from 'next';

import { CheckoutView } from './components/checkout-view';

export const metadata: Metadata = {
  title: 'Checkout',
  robots: { index: false, follow: false },
};

function CheckoutPage() {
  return (
    <main className='mx-auto w-full max-w-5xl flex-1 px-4 py-10'>
      <h1 className='mb-6 text-3xl font-bold tracking-tight'>Checkout</h1>
      <CheckoutView />
    </main>
  );
}

export default CheckoutPage;
