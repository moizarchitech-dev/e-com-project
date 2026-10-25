import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import type { Product } from '@/types';
import { money } from '@/lib/utils';
import Gallery from '@/components/Gallery';
import AddToCartForm from '@/components/AddToCartForm';
import ProductCard from '@/components/ProductCard';

async function getProduct(slug: string) {
  const { data } = await createClient().from('products').select('*').eq('slug', slug).eq('is_active', true).maybeSingle();
  return data as Product | null;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await getProduct(params.slug);
  return { title: p?.title ?? 'Product', description: p?.description ?? undefined };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const p = await getProduct(params.slug);
  if (!p) notFound();

  let related: Product[] = [];
  if (p.category_id) {
    const { data } = await createClient().from('products').select('*').eq('is_active', true)
      .eq('category_id', p.category_id).neq('id', p.id).limit(4);
    related = (data ?? []) as Product[];
  }
  const sale = p.compare_at_price && p.compare_at_price > p.price;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid gap-10 md:grid-cols-2">
        <Gallery images={p.images} title={p.title} />
        <div>
          <h1 className="text-4xl font-semibold">{p.title}</h1>
          <p className="mt-3 text-2xl">{money(p.price)} {sale && <s className="ml-2 text-lg text-ink/50">{money(p.compare_at_price!)}</s>}</p>
          <p className="mt-4 max-w-prose text-ink/80">{p.description}</p>
          <div className="mt-8"><AddToCartForm product={p} /></div>
          <p className="mt-6 text-sm text-ink/60">Free standard shipping on orders over $75.</p>
        </div>
      </div>
      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 text-2xl font-semibold">You might also like</h2>
          <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">{related.map((r) => <li key={r.id}><ProductCard product={r} /></li>)}</ul>
        </section>
      )}
    </div>
  );
}
