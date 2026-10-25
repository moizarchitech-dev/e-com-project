'use client';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import type { Category } from '@/types';
import { cn } from '@/lib/utils';

export default function Filters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [min, setMin] = useState(sp.get('min') ?? '');
  const [max, setMax] = useState(sp.get('max') ?? '');

  function href(changes: Record<string, string | null>) {
    const p = new URLSearchParams(sp.toString());
    Object.entries(changes).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)));
    p.delete('page');
    const q = p.toString();
    return q ? `${pathname}?${q}` : pathname;
  }
  const active = sp.get('category');

  return (
    <aside aria-label="Filters" className="space-y-6 text-sm">
      <div>
        <label htmlFor="sort" className="label">Sort by</label>
        <select id="sort" className="input" value={sp.get('sort') ?? 'newest'} onChange={(e) => router.push(href({ sort: e.target.value }))}>
          <option value="newest">Newest</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
      </div>
      <div>
        <h2 className="label font-sans">Category</h2>
        <ul className="space-y-1">
          <li><Link href={href({ category: null })} className={cn('block py-1', !active && 'font-semibold text-pine')}>All</Link></li>
          {categories.map((c) => (
            <li key={c.id}><Link href={href({ category: c.slug })} className={cn('block py-1', active === c.slug && 'font-semibold text-pine')}>{c.name}</Link></li>
          ))}
        </ul>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); router.push(href({ min: min || null, max: max || null })); }}>
        <h2 className="label font-sans">Price (USD)</h2>
        <div className="flex items-center gap-2">
          <input className="input" inputMode="numeric" aria-label="Minimum price" placeholder="Min" value={min} onChange={(e) => setMin(e.target.value)} />
          <span>–</span>
          <input className="input" inputMode="numeric" aria-label="Maximum price" placeholder="Max" value={max} onChange={(e) => setMax(e.target.value)} />
        </div>
        <button className="btn btn-secondary mt-2 w-full">Apply price</button>
      </form>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={sp.get('inStock') === '1'} onChange={(e) => router.push(href({ inStock: e.target.checked ? '1' : null }))} />
        In stock only
      </label>
    </aside>
  );
}
