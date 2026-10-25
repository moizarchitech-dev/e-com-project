import { Suspense } from 'react';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import type { Category, Product } from '@/types';
import ProductCard from '@/components/ProductCard';
import Filters from '@/components/Filters';
import Pagination from '@/components/Pagination';

export const metadata: Metadata = { title: 'All products' };
const PAGE_SIZE = 12;
type SP = { category?: string; min?: string; max?: string; inStock?: string; sort?: string; page?: string };

export default async function ProductsPage({ searchParams }: { searchParams: SP }) {
  const supabase = createClient();
  const { data: cats } = await supabase.from('categories').select('*').order('name');
  const categories = (cats ?? []) as Category[];

  const page = Math.max(1, Number(searchParams.page) || 1);
  let q = supabase.from('products').select('*', { count: 'exact' }).eq('is_active', true);

  const cat = categories.find((c) => c.slug === searchParams.category);
  if (cat) q = q.eq('category_id', cat.id);
  const min = Number(searchParams.min), max = Number(searchParams.max);
  if (searchParams.min && Number.isFinite(min)) q = q.gte('price', Math.round(min * 100));
  if (searchParams.max && Number.isFinite(max)) q = q.lte('price', Math.round(max * 100));
  if (searchParams.inStock === '1') q = q.gt('stock', 0);
  if (searchParams.sort === 'price_asc') q = q.order('price', { ascending: true });
  else if (searchParams.sort === 'price_desc') q = q.order('price', { ascending: false });
  else q = q.order('created_at', { ascending: false });

  const { data, count } = await q.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  const products = (data ?? []) as Product[];
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-4xl font-semibold">{cat ? cat.name : 'All products'}</h1>
      <p className="mt-1 text-sm text-ink/60">{count ?? 0} {count === 1 ? 'product' : 'products'}</p>
      <div className="mt-8 grid gap-10 md:grid-cols-[220px_1fr]">
        <Suspense><Filters categories={categories} /></Suspense>
        <div>
          {products.length === 0 ? (
            <p className="panel text-center text-ink/70">No products match these filters. Try widening the price range or clearing the category.</p>
          ) : (
            <ul className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-3">
              {products.map((p) => <li key={p.id}><ProductCard product={p} /></li>)}
            </ul>
          )}
          <Pagination page={page} totalPages={totalPages} params={searchParams} />
        </div>
      </div>
    </div>
  );
}
