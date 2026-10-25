import type { Coupon } from '@/types';

export const DELIVERY = {
  standard: { label: 'Standard', detail: '4–6 business days', cost: 500, days: 5, freeOver: 7500 },
  express: { label: 'Express', detail: '1–2 business days', cost: 1500, days: 2, freeOver: null },
} as const;
export type DeliveryMethod = keyof typeof DELIVERY;

export function shippingCost(method: DeliveryMethod, subtotalAfterDiscount: number) {
  const d = DELIVERY[method];
  return d.freeOver !== null && subtotalAfterDiscount >= d.freeOver ? 0 : d.cost;
}

export function estimatedDelivery(method: DeliveryMethod) {
  const dt = new Date();
  dt.setDate(dt.getDate() + DELIVERY[method].days);
  return dt.toISOString().slice(0, 10);
}

export function applyCoupon(c: Coupon, subtotal: number): { ok: true; discount: number } | { ok: false; message: string } {
  if (!c.is_active) return { ok: false, message: 'This code is no longer active.' };
  if (c.expires_at && new Date(c.expires_at) < new Date()) return { ok: false, message: 'This code has expired.' };
  if (c.max_uses !== null && c.used_count >= c.max_uses) return { ok: false, message: 'This code has been fully redeemed.' };
  if (subtotal < c.min_subtotal) return { ok: false, message: 'Your subtotal is below the minimum for this code.' };
  const raw = c.type === 'percent' ? Math.round((subtotal * c.value) / 100) : c.value;
  return { ok: true, discount: Math.min(raw, subtotal) };
}
