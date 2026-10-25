import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { AddressJson, Order } from '@/types';
import { formatDate, money } from '@/lib/utils';
import OrderStatusBadge from '@/components/OrderStatusBadge';

const STEPS = ['processing', 'shipped', 'delivered'] as const;

function Addr({ a }: { a: AddressJson }) {
  return <p className="text-sm text-ink/70">{a.fullName}<br />{a.line1}{a.line2 && `, ${a.line2}`}<br />{a.city}{a.state && `, ${a.state}`} {a.postalCode}<br />{a.country}</p>;
}

export default async function OrderDetail({ params }: { params: { id: string } }) {
  const { data, error } = await createClient().from('orders').select('*, order_items(*)').eq('id', params.id).maybeSingle();
  if (error || !data) notFound();
  const o = data as Order;
  const stepIndex = STEPS.indexOf(o.status as (typeof STEPS)[number]);

  return (
    <div className="space-y-8">
      <Link href="/account/orders" className="text-sm font-semibold text-pine underline">All orders</Link>
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-semibold">Order #{o.id.slice(0, 8).toUpperCase()}</h2><OrderStatusBadge status={o.status} />
        <span className="text-sm text-ink/60">Placed {formatDate(o.created_at)}</span>
      </div>

      {o.status !== 'cancelled' && o.status !== 'pending' && (
        <ol className="grid grid-cols-3 gap-2 text-sm" aria-label="Order progress">
          {STEPS.map((s, i) => (
            <li key={s} className={`border-t-4 pt-2 capitalize ${i <= stepIndex ? 'border-pine font-semibold' : 'border-ink/15 text-ink/50'}`}>{s}</li>
          ))}
        </ol>
      )}

      <section className="panel text-sm">
        <h3 className="mb-2 text-lg font-semibold">Delivery</h3>
        <p>{o.delivery_method === 'express' ? 'Express' : 'Standard'} shipping{o.estimated_delivery && <> · estimated by {formatDate(o.estimated_delivery)}</>}</p>
        <p className="mt-1">Tracking: {o.tracking_number ? <strong>{o.tracking_number}</strong> : <span className="text-ink/60">Added once your order ships</span>}</p>
      </section>

      <section className="panel">
        <h3 className="mb-3 text-lg font-semibold">Items</h3>
        <ul className="divide-y divide-ink/10 text-sm">
          {o.order_items?.map((i) => (
            <li key={i.id} className="flex justify-between py-2">
              <span>{i.quantity} × {i.title}{Object.keys(i.options ?? {}).length > 0 && <span className="text-ink/60"> ({Object.values(i.options).join(' / ')})</span>}</span>
              <span>{money(i.price * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-1 border-t border-ink/10 pt-3 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(o.subtotal)}</dd></div>
          {o.discount > 0 && <div className="flex justify-between"><dt>Discount</dt><dd>−{money(o.discount)}</dd></div>}
          <div className="flex justify-between"><dt>Shipping</dt><dd>{o.shipping_cost === 0 ? 'Free' : money(o.shipping_cost)}</dd></div>
          <div className="flex justify-between text-base font-semibold"><dt>Total</dt><dd>{money(o.total_amount)}</dd></div>
        </dl>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="panel"><h3 className="mb-1 font-semibold">Shipping address</h3><Addr a={o.shipping_address} /></section>
        <section className="panel"><h3 className="mb-1 font-semibold">Billing address</h3><Addr a={o.billing_address} /></section>
      </div>
    </div>
  );
}
