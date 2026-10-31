'use client';

import { ReactNode, useEffect } from 'react';

import { useCartStore } from './store';

interface CartProviderProps {
  children: ReactNode;
}

// Restores the saved cart once on the client, then marks the store ready. If storage is blocked the cart simply
// starts empty and still works for the current visit.
export function CartProvider({ children }: CartProviderProps) {
  useEffect(() => {
    Promise.resolve(useCartStore.persist.rehydrate())
      .catch(() => undefined)
      .finally(() => useCartStore.getState().setHydrated());

    // keeps several open tabs in sync
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'kodeva:cart') {
        void useCartStore.persist.rehydrate();
      }
    };

    window.addEventListener('storage', onStorage);

    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return <>{children}</>;
}
