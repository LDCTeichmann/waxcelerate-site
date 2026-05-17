import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/lib/data';

export interface CartItem {
  productId: string;
  title: string;
  titleEn: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartStore {
  // Cart state
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;

  // Stock state (fetched from /api/stock on mount)
  // -1 = not tracked (unlimited), 0 = out of stock, >0 = units available
  stockMap: Record<string, number>;
  fetchStock: () => Promise<void>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      // ── Cart ──────────────────────────────────────────────────────────────
      items: [],
      isOpen: false,

      addItem: (product) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                productId: product.id,
                title: product.title,
                titleEn: product.titleEn,
                price: product.price,
                image: product.image,
                quantity: 1,
              },
            ],
          };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      updateQty: (productId, qty) =>
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter((i) => i.productId !== productId)
              : state.items.map((i) =>
                  i.productId === productId ? { ...i, quantity: qty } : i
                ),
        })),

      clear: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      // ── Stock ─────────────────────────────────────────────────────────────
      stockMap: {},

      fetchStock: async () => {
        try {
          const res = await fetch('/api/stock');
          if (!res.ok) return;
          const data = await res.json() as Record<string, number>;
          set({ stockMap: data });
        } catch {
          // Fail silently — stock defaults to -1 (unlimited) when map is empty
        }
      },
    }),
    {
      name: 'waxcelerate-cart',
      // Only persist cart items — stock is always re-fetched on mount
      partialize: (state) => ({ items: state.items }),
    }
  )
);

// ── Selectors / helpers ────────────────────────────────────────────────────

export const cartItemCount = (items: CartItem[]): number =>
  items.reduce((sum, i) => sum + i.quantity, 0);

export const cartTotalPrice = (items: CartItem[]): number =>
  items.reduce((sum, i) => sum + i.price * i.quantity, 0);

/** -1 = unlimited, 0 = sold out, >0 = units left */
export const getStock = (stockMap: Record<string, number>, productId: string): number =>
  stockMap[productId] ?? -1;

export const isInStock = (stockMap: Record<string, number>, productId: string): boolean => {
  const s = getStock(stockMap, productId);
  return s === -1 || s > 0;
};

export const isLowStock = (stockMap: Record<string, number>, productId: string): boolean => {
  const s = getStock(stockMap, productId);
  return s > 0 && s <= 5;
};
