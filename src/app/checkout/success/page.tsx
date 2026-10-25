import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe';
import type { Order } from '@/types';
import { formatDate, money } from '@/lib/utils';
import ClearCart from '@/components/ClearCart';

export const metadata = { title: 'Order confirmed' };

export default async function SuccessPage({ searchParams }: { searchParams: { session_id?: string } }) {
  const id = searchParams.session_id;
  if (!id?.startsWith('pi_')) notFound();

  const { data } = await createClient().from('orders').select('*, order_items(*)').eq('payment_intent_id', id).maybeSingle();
  if (!data) notFound();
  const order = data as Order;
  const intent = await getStripe().paymentIntents.retrieve(id);
  const paid = intent.status === 'succeeded' || intent.status === 'processing';

  if (!paid) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-3xl font-semibold">Payment not completed</h1>
        <p className="mt-2 text-ink/70">Your card wasn’t charged. Your cart is still saved.</p>
        <Link href="/checkout" className="btn btn-primary mt-6">Back to checkout</Link>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <ClearCart />
      <h1 className="text-4xl font-semibold">Thank you, your order is in.</h1>
      <p className="mt-2 text-ink/70">Order <strong>#{order.id.slice(0, 8).toUpperCase()}</strong>.
        {order.estimated_delivery && <> Estimated delivery by {formatDate(order.estimated_delivery)}.</>}</p>
      <div className="panel mt-8 text-sm">
        <ul className="divide-y divide-ink/10">
          {order.order_items?.map((i) => (
            <li key={i.id} className="flex justify-between py-2"><span>{i.quantity} × {i.title}</span><span>{money(i.price * i.quantity)}</span></li>
          ))}
        </ul>
        <p className="mt-3 flex justify-between border-t border-ink/10 pt-3 font-semibold"><span>Total paid</span><span>{money(order.total_amount)}</span></p>
      </div>
      <div className="mt-8 flex gap-3">
        <Link href={`/account/orders/${order.id}`} className="btn btn-primary">View order</Link>
        <Link href="/products" className="btn btn-secondary">Keep shopping</Link>
      </div>
    </div>
  );
}
