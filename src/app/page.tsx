import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import type { Category, Product } from '@/types';
import ProductCard from '@/components/ProductCard';

export default async function Home() {
  const supabase = createClient();
  const [{ data: featured }, { data: cats }] = await Promise.all([
    supabase.from('products').select('*').eq('is_active', true).eq('is_featured', true).order('created_at', { ascending: false }).limit(8),
    supabase.from('categories').select('*').order('name').limit(4),
  ]);
  const products = (featured ?? []) as Product[];
  const categories = (cats ?? []) as Category[];

  return (
    <>
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-[1.1fr_1fr] md:items-center md:py-20">
        <div>
          <h1 className="text-5xl font-semibold leading-[1.05] md:text-7xl">Everyday things, made to be used hard.</h1>
          <p className="mt-5 max-w-md text-lg text-ink/70">Kitchen, living and outdoor pieces built to last through daily life, not just the photo shoot.</p>
          <div className="mt-8 flex gap-3">
            <Link href="/products" className="btn btn-primary">Shop all products</Link>
            <Link href="/products?sort=newest" className="btn btn-secondary">See what’s new</Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {products.slice(0, 4).map((p, i) => (
            <Link key={p.id} href={`/products/${p.slug}`} className={`relative block aspect-[4/5] overflow-hidden rounded-lg bg-ink/5 ${i % 2 ? 'mt-8' : ''}`}>
              {p.images[0] && <Image src={p.images[0]} alt={p.title} fill priority sizes="25vw" className="object-cover" />}
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-marigold">
        <p className="mx-auto max-w-7xl px-4 py-3 text-center text-sm font-semibold">
          Free standard shipping over $75. Use code WELCOME10 for 10% off your first order.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-16">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-3xl font-semibold">Featured</h2>
          <Link href="/products" className="text-sm font-semibold text-pine underline">View all</Link>
        </div>
        <ul className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4" aria-label="Featured products">
          {products.map((p) => (
            <li key={p.id} className="w-56 shrink-0 snap-start sm:w-64"><ProductCard product={p} /></li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-16">
        <h2 className="mb-6 text-3xl font-semibold">Shop by room</h2>
        <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {categories.map((c) => (
            <li key={c.id}>
              <Link href={`/products?category=${c.slug}`} className="group relative block aspect-[4/3] overflow-hidden rounded-lg bg-ink/10">
                {c.image_url && <Image src={c.image_url} alt="" fill sizes="25vw" className="object-cover" />}
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-4 font-display text-xl font-semibold text-white">{c.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
