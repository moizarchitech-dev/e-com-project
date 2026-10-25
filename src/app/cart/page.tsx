'use client';
import Link from 'next/link';
import { subtotalOf, useCart } from '@/store/cart';
import { useMounted } from '@/lib/hooks';
import CartLines from '@/components/CartLines';
import CouponInput from '@/components/CouponInput';
import OrderSummary from '@/components/OrderSummary';

export default function CartPage() {
  const mounted = useMounted();
  const { items, coupon } = useCart();
  if (!mounted) return <div className="mx-auto max-w-7xl px-4 py-10" />;
  const subtotal = subtotalOf(items);
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-4xl font-semibold">Your cart</h1>
      {items.length === 0 ? (
        <p className="mt-6 text-ink/70">Nothing here yet. <Link href="/products" className="font-semibold text-pine underline">Browse products</Link></p>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
          <CartLines />
          <div className="space-y-4">
            <CouponInput subtotal={subtotal} />
            <OrderSummary subtotal={subtotal} discount={coupon?.discount ?? 0} shipping={null}>
              <Link href="/checkout" className="btn btn-primary w-full">Continue to checkout</Link>
            </OrderSummary>
          </div>
        </div>
      )}
    </div>
  );
}
