import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-3xl font-semibold">We can’t find that page</h1>
      <p className="mt-2 text-ink/70">The link may be old, or the product may no longer be sold.</p>
      <Link href="/products" className="btn btn-primary mt-6">Browse products</Link>
    </div>
  );
}
