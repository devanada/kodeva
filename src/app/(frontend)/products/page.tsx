import type { Metadata } from 'next';

import { getProducts } from '@/utils/services/products';

import { ProductCatalog } from './components/product-catalog';

export const metadata: Metadata = {
  title: 'Katalog Produk',
  description: 'Aplikasi kasir, HR & payroll, dan add-on untuk UMKM. Pilih paket Basic, Pro, atau Business.',
  alternates: { canonical: '/products' },
};

function ProductsPage() {
  return (
    <main className='mx-auto w-full max-w-5xl flex-1 px-4 py-10'>
      <h1 className='mb-2 text-3xl font-bold tracking-tight'>Katalog produk</h1>
      <p className='text-muted-foreground mb-6'>Pilih aplikasi dan paket yang sesuai dengan usaha Anda.</p>
      <ProductCatalog products={getProducts()} />
    </main>
  );
}

export default ProductsPage;
