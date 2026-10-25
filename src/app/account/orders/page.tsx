import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import type { Order } from '@/types';
import { formatDate, money } from '@/lib/utils';
import OrderStatusBadge from '@/components/OrderStatusBadge';

export const metadata = { title: 'Your orders' };

export default async function OrdersPage() {
  const { data } = await createClient().from('orders').select('*').neq('status', 'pending').order('created_at', { ascending: false });
  const orders = (data ?? []) as Order[];
  if (orders.length === 0) {
    return <p className="text-ink/70">You haven’t placed an order yet. <Link href="/products" className="font-semibold text-pine underline">Browse products</Link></p>;
  }
  return (
    <ul className="space-y-3">
      {orders.map((o) => (
        <li key={o.id}>
          <Link href={`/account/orders/${o.id}`} className="panel flex flex-wrap items-center justify-between gap-3 hover:border-pine">
            <div><p className="font-semibold">Order #{o.id.slice(0, 8).toUpperCase()}</p><p className="text-sm text-ink/60">{formatDate(o.created_at)}</p></div>
            <OrderStatusBadge status={o.status} />
            <p className="font-semibold">{money(o.total_amount)}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
