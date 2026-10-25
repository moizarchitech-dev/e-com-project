'use client';
import { money } from '@/lib/utils';

export default function OrderSummary({ subtotal, discount, shipping, children }: {
  subtotal: number; discount: number; shipping: number | null; children?: React.ReactNode;
}) {
  const total = subtotal - discount + (shipping ?? 0);
  return (
    <div className="panel space-y-3 text-sm">
      <h2 className="text-lg font-semibold">Order summary</h2>
      <dl className="space-y-2">
        <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div>
        {discount > 0 && <div className="flex justify-between text-pine"><dt>Discount</dt><dd>−{money(discount)}</dd></div>}
        <div className="flex justify-between"><dt>Shipping</dt><dd>{shipping === null ? 'Calculated next' : shipping === 0 ? 'Free' : money(shipping)}</dd></div>
        <div className="flex justify-between border-t border-ink/10 pt-3 text-base font-semibold"><dt>Total</dt><dd>{money(total)}</dd></div>
      </dl>
      {children}
    </div>
  );
}
