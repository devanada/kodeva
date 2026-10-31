import Image from 'next/image';

import { ROUTES } from '@/utils/constants/routes';
import type { ICmsImage } from '@/utils/services/cms/types';

import { CtaButton } from '../cta-button';

interface HeroProps {
  title: string;
  subtitle: string;
  ctaLabel: string;
  image?: ICmsImage | null;
}

function Hero({ title, subtitle, ctaLabel, image }: HeroProps) {
  return (
    <section className='mx-auto grid max-w-5xl items-center gap-8 px-4 py-10 md:grid-cols-2 md:py-16'>
      <div className='flex flex-col items-start gap-5'>
        <h1 className='text-3xl leading-tight font-bold tracking-tight md:text-5xl'>{title}</h1>
        <p className='text-muted-foreground text-lg'>{subtitle}</p>
        <CtaButton href={ROUTES.products} ctaId='hero_catalog' label={ctaLabel} />
      </div>
      {image?.url ? (
        <Image
          src={image.url}
          alt={image.alt}
          width={image.width || 800}
          height={image.height || 600}
          sizes='(min-width: 768px) 50vw, 100vw'
          priority
          className='h-auto w-full rounded-2xl object-cover'
        />
      ) : (
        <div aria-hidden className='from-primary/20 to-primary/5 aspect-4/3 w-full rounded-2xl bg-gradient-to-br' />
      )}
    </section>
  );
}

export { Hero };
