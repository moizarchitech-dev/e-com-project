'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { X } from 'lucide-react';
import { subtotalOf, useCart } from '@/store/cart';
import { useMounted } from '@/lib/hooks';
import { money } from '@/lib/utils';
import CartLines from './CartLines';

export default function CartDrawer() {
  const mounted = useMounted();
  const { items, open, setOpen } = useCart();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setOpen]);
  if (!mounted || !open) return null;
  const close = () => setOpen(false);
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink/40" onClick={close} aria-hidden />
      <aside role="dialog" aria-modal="true" aria-label="Shopping cart" className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
          <h2 className="text-xl font-semibold">Your cart</h2>
          <button onClick={close} aria-label="Close cart"><X /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5">
          {items.length === 0 ? (
            <p className="py-10 text-center text-ink/60">Your cart is empty. <Link href="/products" onClick={close} className="font-semibold text-pine underline">Start shopping</Link></p>
          ) : <CartLines onNavigate={close} />}
        </div>
        {items.length > 0 && (
          <div className="border-t border-ink/10 p-5">
            <div className="mb-4 flex justify-between font-semibold"><span>Subtotal</span><span>{money(subtotalOf(items))}</span></div>
            <Link href="/cart" onClick={close} className="btn btn-secondary mb-2 w-full">View cart</Link>
            <Link href="/checkout" onClick={close} className="btn btn-primary w-full">Check out</Link>
          </div>
        )}
      </aside>
    </div>
  );
}
