'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';

import { CATEGORY_LABELS } from '@/utils/constants/products';
import { IProduct, ProductCategory } from '@/utils/services/products/types';

import { ProductCard } from '../product-card';

type Filter = ProductCategory | 'all';

interface ProductCatalogProps {
  products: IProduct[];
}

// every product is in the server-rendered HTML (search engines see them all); the filter only hides cards
function ProductCatalog({ products }: ProductCatalogProps) {
  const [filter, setFilter] = useState<Filter>('all');
  const categories = Array.from(new Set(products.map((product) => product.category)));
  const visible = filter === 'all' ? products : products.filter((product) => product.category === filter);

  return (
    <>
      <div role='group' aria-label='Filter kategori' className='mb-6 flex flex-wrap gap-2'>
        {(['all', ...categories] as Filter[]).map((category) => (
          <Button
            key={category}
            type='button'
            variant={filter === category ? 'default' : 'outline'}
            aria-pressed={filter === category}
            className='min-h-11'
            onClick={() => setFilter(category)}
          >
            {category === 'all' ? 'Semua' : CATEGORY_LABELS[category]}
          </Button>
        ))}
      </div>
      {visible.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Produk tidak ditemukan</EmptyTitle>
            <EmptyDescription>Belum ada produk di kategori ini.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {visible.map((product) => (
            <li key={product.slug} className='relative'>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export { ProductCatalog };
