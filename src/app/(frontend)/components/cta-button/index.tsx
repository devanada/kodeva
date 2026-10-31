'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';

import { trackCtaClick } from '@/utils/tracking/data-layer';

interface CtaButtonProps {
  href: string;
  ctaId: string;
  label: string;
  variant?: React.ComponentProps<typeof Button>['variant'];
  size?: React.ComponentProps<typeof Button>['size'];
}

function CtaButton({ href, ctaId, label, variant, size = 'lg' }: CtaButtonProps) {
  return (
    <Button asChild variant={variant} size={size}>
      <Link href={href} onClick={() => trackCtaClick({ cta_id: ctaId, cta_text: label, cta_destination: href })}>
        {label}
      </Link>
    </Button>
  );
}

export { CtaButton };
