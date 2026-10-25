'use client';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/store/cart';
import { useMounted } from '@/lib/hooks';

export default function CartButton() {
  const mounted = useMounted();
  const count = useCart((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const setOpen = useCart((s) => s.setOpen);
  return (
    <button onClick={() => setOpen(true)} className="relative p-1" aria-label={`Open cart, ${mounted ? count : 0} items`}>
      <ShoppingBag size={22} />
      {mounted && count > 0 && (
        <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-marigold px-1 text-xs font-bold">{count}</span>
      )}
    </button>
  );
}
