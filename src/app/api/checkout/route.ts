import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getStripe } from '@/lib/stripe';
import { checkoutRequestSchema } from '@/lib/validators';
import { applyCoupon, estimatedDelivery, shippingCost } from '@/lib/pricing';
import type { Coupon, Product } from '@/types';

/** Re-prices the cart from the database, creates a pending order and a Stripe PaymentIntent. */
export async function POST(req: Request) {
  const { data: { user } } = await createClient().auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in to check out.' }, { status: 401 });

  const parsed = checkoutRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Some checkout details are missing or invalid.' }, { status: 400 });
  const body = parsed.data;

  const admin = createAdminClient();
  const ids = [...new Set(body.items.map((i) => i.productId))];
  const { data } = await admin.from('products').select('*').in('id', ids).eq('is_active', true);
  const products = new Map(((data ?? []) as Product[]).map((p) => [p.id, p]));

  // Combine duplicate lines per product to check stock accurately.
  const wanted = new Map<string, number>();
  for (const i of body.items) wanted.set(i.productId, (wanted.get(i.productId) ?? 0) + i.quantity);
  for (const [id, qty] of wanted) {
    const p = products.get(id);
    if (!p) return NextResponse.json({ error: 'An item in your cart is no longer available.' }, { status: 409 });
    if (p.stock < qty) return NextResponse.json({ error: `Only ${p.stock} of “${p.title}” left in stock.` }, { status: 409 });
  }

  const subtotal = body.items.reduce((n, i) => n + products.get(i.productId)!.price * i.quantity, 0);

  let discount = 0;
  let couponId: string | null = null;
  if (body.couponCode) {
    const { data: c } = await admin.from('coupons').select('*').eq('code', body.couponCode.trim().toUpperCase()).maybeSingle();
    const res = c ? applyCoupon(c as Coupon, subtotal) : ({ ok: false, message: 'That code isn’t valid.' } as const);
    if (!res.ok) return NextResponse.json({ error: res.message }, { status: 400 });
    discount = res.discount;
    couponId = (c as Coupon).id;
  }
  const shipping = shippingCost(body.deliveryMethod, subtotal - discount);
  const total = subtotal - discount + shipping;

  const stripe = getStripe();
  const intent = await stripe.paymentIntents.create({
    amount: total, currency: 'usd', automatic_payment_methods: { enabled: true }, metadata: { user_id: user.id },
  });

  const { data: order, error } = await admin.from('orders').insert({
    user_id: user.id, status: 'pending', subtotal, discount, shipping_cost: shipping, total_amount: total,
    shipping_address: body.shippingAddress, billing_address: body.billingAddress, delivery_method: body.deliveryMethod,
    coupon_id: couponId, payment_intent_id: intent.id, estimated_delivery: estimatedDelivery(body.deliveryMethod),
  }).select('id').single();

  if (error || !order) {
    console.error('Checkout order insert failed:', error?.code, error?.message, error?.details, error?.hint);
    await stripe.paymentIntents.cancel(intent.id).catch(() => {});
    return NextResponse.json({ error: 'We couldn’t create your order. Try again.' }, { status: 500 });
  }

  const { error: itemsError } = await admin.from('order_items').insert(
    body.items.map((i) => {
      const p = products.get(i.productId)!;
      return { order_id: order.id, product_id: p.id, title: p.title, quantity: i.quantity, price: p.price, options: i.options };
    }),
  );
  if (itemsError) {
    console.error('Checkout order items insert failed:', itemsError.code, itemsError.message, itemsError.details, itemsError.hint);
    await admin.from('orders').delete().eq('id', order.id);
    await stripe.paymentIntents.cancel(intent.id).catch(() => {});
    return NextResponse.json({ error: 'We couldn’t create your order. Try again.' }, { status: 500 });
  }
  await stripe.paymentIntents.update(intent.id, { metadata: { user_id: user.id, order_id: order.id } });

  return NextResponse.json({
    clientSecret: intent.client_secret, paymentIntentId: intent.id, orderId: order.id,
    totals: { subtotal, discount, shipping, total },
  });
}
