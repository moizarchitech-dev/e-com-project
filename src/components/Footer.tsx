import Link from 'next/link';
export default function Footer() {
  return (
    <footer className="mt-20 border-t border-ink/10 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-6 px-4 py-10 text-sm text-ink/70">
        <p><span className="font-display text-lg font-bold text-ink">Fieldhouse</span><br />Homewares built for daily use.</p>
        <nav className="flex gap-6" aria-label="Footer">
          <Link href="/products">Shop</Link><Link href="/cart">Cart</Link><Link href="/account/orders">Orders</Link>
        </nav>
      </div>
    </footer>
  );
}
