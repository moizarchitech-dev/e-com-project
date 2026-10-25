'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/store/cart';
import { money } from '@/lib/utils';

export default function CartLines({ onNavigate }: { onNavigate?: () => void }) {
  const { items, setQty, remove } = useCart();
  return (
    <ul className="divide-y divide-ink/10">
      {items.map((i) => (
        <li key={i.key} className="flex gap-4 py-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-ink/5">
            {i.image && <Image src={i.image} alt="" fill sizes="80px" className="object-cover" />}
          </div>
          <div className="flex-1 text-sm">
            <Link href={`/products/${i.slug}`} onClick={onNavigate} className="font-semibold hover:text-pine">{i.title}</Link>
            {Object.keys(i.options).length > 0 && (
              <p className="text-ink/60">{Object.values(i.options).join(' / ')}</p>
            )}
            <p className="mt-1">{money(i.price)}</p>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex items-center rounded-md border border-ink/20">
                <button className="p-1.5" aria-label="Decrease quantity" onClick={() => setQty(i.key, i.quantity - 1)} disabled={i.quantity <= 1}><Minus size={14} /></button>
                <span className="w-8 text-center" aria-live="polite">{i.quantity}</span>
                <button className="p-1.5" aria-label="Increase quantity" onClick={() => setQty(i.key, i.quantity + 1)} disabled={i.quantity >= i.stock}><Plus size={14} /></button>
              </div>
              <button onClick={() => remove(i.key)} className="text-ink/60 hover:text-red-700" aria-label={`Remove ${i.title}`}><Trash2 size={16} /></button>
            </div>
          </div>
          <p className="text-sm font-semibold">{money(i.price * i.quantity)}</p>
        </li>
      ))}
    </ul>
  );
}
