import Link from 'next/link';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-4xl font-semibold">Your account</h1>
      <nav aria-label="Account" className="mt-4 flex gap-6 border-b border-ink/10 text-sm font-semibold">
        <Link href="/account" className="pb-3 hover:text-pine">Settings</Link>
        <Link href="/account/orders" className="pb-3 hover:text-pine">Orders</Link>
      </nav>
      <div className="mt-8">{children}</div>
    </div>
  );
}
