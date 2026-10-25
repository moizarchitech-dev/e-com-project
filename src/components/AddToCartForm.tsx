'use client';
import { useState } from 'react';
import type { Product } from '@/types';
import { useCart } from '@/store/cart';
import { cn } from '@/lib/utils';

function Choice({ label, values, value, onChange }: { label: string; values: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <fieldset>
      <legend className="label">{label}: <span className="font-normal">{value}</span></legend>
      <div className="flex flex-wrap gap-2">
        {values.map((v) => (
          <label key={v} className={cn('cursor-pointer rounded-md border px-3 py-1.5 text-sm has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-pine', v === value ? 'border-pine bg-pine text-white' : 'border-ink/20 bg-white')}>
            <input type="radio" name={label} className="sr-only" checked={v === value} onChange={() => onChange(v)} />{v}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function AddToCartForm({ product: p }: { product: Product }) {
  const add = useCart((s) => s.add);
  const sizes = p.attributes.sizes ?? [];
  const colors = p.attributes.colors ?? [];
  const [size, setSize] = useState(sizes[0] ?? '');
  const [color, setColor] = useState(colors[0] ?? '');
  const [qty, setQty] = useState(1);
  const out = p.stock === 0;

  function submit() {
    const options: Record<string, string> = {};
    if (size) options.Size = size;
    if (color) options.Color = color;
    add({ productId: p.id, slug: p.slug, title: p.title, price: p.price, image: p.images[0] ?? null, stock: p.stock, options }, qty);
  }

  return (
    <div className="space-y-5">
      {sizes.length > 0 && <Choice label="Size" values={sizes} value={size} onChange={setSize} />}
      {colors.length > 0 && <Choice label="Color" values={colors} value={color} onChange={setColor} />}
      <p className={cn('text-sm font-medium', out ? 'text-red-700' : p.stock <= 5 ? 'text-amber-700' : 'text-pine')}>
        {out ? 'Sold out' : p.stock <= 5 ? `Only ${p.stock} left` : 'In stock'}
      </p>
      <div className="flex gap-3">
        <div>
          <label htmlFor="qty" className="sr-only">Quantity</label>
          <input id="qty" type="number" min={1} max={Math.max(1, p.stock)} value={qty} disabled={out}
            onChange={(e) => setQty(Math.max(1, Math.min(p.stock, Number(e.target.value) || 1)))} className="input w-20" />
        </div>
        <button onClick={submit} disabled={out} className="btn btn-primary flex-1">{out ? 'Sold out' : 'Add to cart'}</button>
      </div>
    </div>
  );
}
