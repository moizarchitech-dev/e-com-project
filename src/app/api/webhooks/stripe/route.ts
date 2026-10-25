import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const signature = req.headers.get('stripe-signature');
  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(raw, signature ?? '', process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return new NextResponse('Invalid signature', { status: 400 });
  }
  const admin = createAdminClient();

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent;
    const { data: order } = await admin.from('orders').select('id, coupon_id, order_items(product_id, quantity)')
      .eq('payment_intent_id', pi.id).maybeSingle();
    if (order) {
      // Claim the order atomically so retried webhooks don't double-decrement stock.
      const { data: claimed } = await admin.from('orders').update({ status: 'processing' })
        .eq('id', order.id).eq('status', 'pending').select('id');
      if (claimed?.length) {
        for (const item of (order.order_items ?? []) as { product_id: string | null; quantity: number }[]) {
          if (!item.product_id) continue;
          const { error } = await admin.rpc('decrement_stock', { p_product: item.product_id, p_qty: item.quantity });
          if (error) console.error('Stock decrement failed', order.id, item.product_id, error.message);
        }
        if (order.coupon_id) await admin.rpc('increment_coupon_use', { p_coupon: order.coupon_id });
      }
    }
  }

  if (event.type === 'payment_intent.payment_failed' || event.type === 'payment_intent.canceled') {
    const pi = event.data.object as Stripe.PaymentIntent;
    await admin.from('orders').update({ status: 'cancelled' }).eq('payment_intent_id', pi.id).eq('status', 'pending');
  }
  return NextResponse.json({ received: true });
}
