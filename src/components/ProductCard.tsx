import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types';
import { money } from '@/lib/utils';

export default function ProductCard({ product: p }: { product: Product }) {
  const sale = p.compare_at_price && p.compare_at_price > p.price;
  return (
    <Link href={`/products/${p.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-ink/5">
        {p.images[0] && <Image src={p.images[0]} alt={p.title} fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover" />}
        {p.stock === 0 && <span className="absolute left-2 top-2 rounded bg-ink px-2 py-0.5 text-xs font-semibold text-white">Sold out</span>}
        {sale && p.stock > 0 && <span className="absolute left-2 top-2 rounded bg-marigold px-2 py-0.5 text-xs font-semibold">Sale</span>}
      </div>
      <h3 className="mt-3 text-base font-semibold group-hover:text-pine">{p.title}</h3>
      <p className="text-sm">
        {money(p.price)} {sale && <s className="ml-1 text-ink/50">{money(p.compare_at_price!)}</s>}
      </p>
    </Link>
  );
}
