import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import CartButton from './CartButton';
import SignOutButton from './SignOutButton';

export default async function Header() {
  const supabase = createClient();
  const [{ data: { user } }, { data: cats }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('categories').select('name, slug').order('name').limit(6),
  ]);
  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4">
        <Link href="/" className="font-display text-2xl font-bold tracking-tight">Fieldhouse</Link>
        <nav aria-label="Categories" className="hidden gap-5 text-sm md:flex">
          <Link href="/products" className="hover:text-pine">All products</Link>
          {(cats ?? []).map((c) => (
            <Link key={c.slug} href={`/products?category=${c.slug}`} className="hover:text-pine">{c.name}</Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link href="/account" className="hover:text-pine">Account</Link>
              <SignOutButton />
            </>
          ) : (
            <Link href="/signin" className="hover:text-pine">Sign in</Link>
          )}
          <CartButton />
        </div>
      </div>
    </header>
  );
}
