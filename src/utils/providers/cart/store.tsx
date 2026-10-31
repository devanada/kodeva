import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { addToLines, removeLine, sanitizeLines, setLineQuantity } from '@/utils/services/cart';
import { ICartLine } from '@/utils/services/cart/types';
import { getProductBySlug } from '@/utils/services/products';
import { PlanId } from '@/utils/services/products/types';

interface CartState {
  lines: ICartLine[];
  // false until the saved cart has been read, so the UI never flashes an empty cart on refresh
  hydrated: boolean;
}

interface CartAction {
  // returns how many licenses were really added (0 when the promo quota is used up)
  addItem: (productSlug: string, planId: PlanId, quantity: number) => number;
  setQuantity: (productSlug: string, planId: PlanId, quantity: number) => void;
  removeItem: (productSlug: string, planId: PlanId) => void;
  clear: () => void;
  setHydrated: () => void;
}

export const useCartStore = create<CartState & CartAction>()(
  persist(
    (set, get) => ({
      lines: [],
      hydrated: false,
      addItem: (productSlug, planId, quantity) => {
        const product = getProductBySlug(productSlug);

        if (!product) {
          return 0;
        }

        const result = addToLines(get().lines, product, planId, quantity);

        set({ lines: result.lines });

        return result.added;
      },
      setQuantity: (productSlug, planId, quantity) =>
        set({ lines: setLineQuantity(get().lines, { productSlug, planId }, quantity) }),
      removeItem: (productSlug, planId) => set({ lines: removeLine(get().lines, { productSlug, planId }) }),
      clear: () => set({ lines: [] }),
      setHydrated: () => set({ hydrated: true, lines: sanitizeLines(get().lines) }),
    }),
    {
      name: 'kodeva:cart',
      version: 1,
      // `window.` on purpose: bare `localStorage` also exists (experimental) in Node during prerender
      storage: createJSONStorage(() => window.localStorage),
      partialize: (state) => ({ lines: state.lines }),
      // read on the client after mount (see CartProvider) so server and first client render match
      skipHydration: true,
    },
  ),
);
