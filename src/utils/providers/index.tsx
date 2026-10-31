'use client';

import { ReactNode } from 'react';

import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

import { CartProvider } from './cart';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <NuqsAdapter>
      <TooltipProvider>
        <CartProvider>{children}</CartProvider>
        <Toaster richColors position='top-center' />
      </TooltipProvider>
    </NuqsAdapter>
  );
}
