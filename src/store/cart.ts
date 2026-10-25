'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = {
  key: string; productId: string; slug: string; title: string; price: number; image: string | null;
  quantity: number; stock: number; options: Record<string, string>;
};
type AppliedCoupon = { code: string; discount: number };
type State = {
  items: CartItem[]; coupon: AppliedCoupon | null; open: boolean;
  add: (item: Omit<CartItem, 'key' | 'quantity'>, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  setCoupon: (c: AppliedCoupon | null) => void;
  setOpen: (o: boolean) => void;
};

const keyOf = (id: string, options: Record<string, string>) =>
  id + '|' + Object.keys(options).sort().map((k) => `${k}:${options[k]}`).join(',');

export const useCart = create<State>()(
  persist(
    (set) => ({
      items: [], coupon: null, open: false,
      add: (item, qty = 1) => set((s) => {
        const key = keyOf(item.productId, item.options);
        const found = s.items.find((i) => i.key === key);
        if (found) {
          return { items: s.items.map((i) => i.key === key ? { ...i, quantity: Math.min(i.quantity + qty, i.stock) } : i), open: true };
        }
        return { items: [...s.items, { ...item, key, quantity: Math.min(qty, item.stock) }], open: true };
      }),
      setQty: (key, qty) => set((s) => ({
        items: s.items.map((i) => i.key === key ? { ...i, quantity: Math.max(1, Math.min(qty, i.stock)) } : i),
      })),
      remove: (key) => set((s) => ({ items: s.items.filter((i) => i.key !== key) })),
      clear: () => set({ items: [], coupon: null }),
      setCoupon: (coupon) => set({ coupon }),
      setOpen: (open) => set({ open }),
    }),
    { name: 'fieldhouse-cart', partialize: (s) => ({ items: s.items, coupon: s.coupon }) },
  ),
);

export const subtotalOf = (items: CartItem[]) => items.reduce((n, i) => n + i.price * i.quantity, 0);
