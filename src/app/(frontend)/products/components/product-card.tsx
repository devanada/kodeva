import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import { CATEGORY_LABELS } from '@/utils/constants/products';
import { ROUTES } from '@/utils/constants/routes';
import { formatIdr } from '@/utils/functions/number';
import { getPromoPrice } from '@/utils/services/products';
import { IProduct } from '@/utils/services/products/types';

interface ProductCardProps {
  product: IProduct;
}

function ProductCard({ product }: ProductCardProps) {
  const startingPlan = product.plans[0];

  return (
    <Card className='h-full'>
      <CardHeader>
        <p className='text-primary text-xs font-medium uppercase'>{CATEGORY_LABELS[product.category]}</p>
        <CardTitle>
          <Link href={`${ROUTES.products}/${product.slug}`} className='after:absolute after:inset-0'>
            {product.name}
          </Link>
        </CardTitle>
        <CardDescription>{product.tagline}</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-2'>
        {product.promo && <Badge className='w-fit'>Diskon {product.promo.discountPercent}%</Badge>}
        <p className='text-sm'>
          Mulai dari{' '}
          {product.promo ? (
            <>
              <span className='text-muted-foreground line-through'>{formatIdr(startingPlan.price)}</span>{' '}
              <span className='font-semibold'>
                {formatIdr(getPromoPrice(startingPlan.price, product.promo.discountPercent))}
              </span>
            </>
          ) : (
            <span className='font-semibold'>{formatIdr(startingPlan.price)}</span>
          )}
          /lisensi/bulan
        </p>
      </CardContent>
      {product.promo && (
        <CardFooter className='text-muted-foreground text-xs'>
          Sisa kuota promo {product.promo.quota} lisensi
        </CardFooter>
      )}
    </Card>
  );
}

export { ProductCard };
