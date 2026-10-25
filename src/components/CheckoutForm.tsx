'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { addressSchema } from '@/lib/validators';
import { DELIVERY, shippingCost, type DeliveryMethod } from '@/lib/pricing';
import { subtotalOf, useCart } from '@/store/cart';
import { useMounted } from '@/lib/hooks';
import { money } from '@/lib/utils';
import AddressFields from './AddressFields';
import CouponInput from './CouponInput';
import OrderSummary from './OrderSummary';
import PaymentElementWrapper from './PaymentElementWrapper';

const schema = z.object({
  shipping: addressSchema,
  billingSame: z.boolean(),
  billing: addressSchema.partial().optional(),
  delivery: z.enum(['standard', 'express']),
}).superRefine((v, ctx) => {
  if (v.billingSame) return;
  const r = addressSchema.safeParse(v.billing);
  if (!r.success) r.error.issues.forEach((i) => ctx.addIssue({ code: z.ZodIssueCode.custom, message: i.message, path: ['billing', ...i.path] }));
});
type FormValues = z.infer<typeof schema>;
type Intent = { clientSecret: string; paymentIntentId: string; total: number };

export default function CheckoutForm({ defaultAddress }: { defaultAddress: Partial<z.infer<typeof addressSchema>> | null }) {
  const mounted = useMounted();
  const { items, coupon } = useCart();
  const [intent, setIntent] = useState<Intent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { shipping: { country: 'US', ...defaultAddress } as FormValues['shipping'], billingSame: true, delivery: 'standard' },
  });
  const billingSame = watch('billingSame');
  const delivery = watch('delivery') as DeliveryMethod;

  if (!mounted) return null;
  if (items.length === 0) {
    return <p className="text-ink/70">Your cart is empty. <Link href="/products" className="font-semibold text-pine underline">Browse products</Link></p>;
  }
  const subtotal = subtotalOf(items);
  const discount = coupon?.discount ?? 0;
  const shipping = shippingCost(delivery, subtotal - discount);

  async function onSubmit(v: FormValues) {
    setError(null);
    const res = await fetch('/api/checkout', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, options: i.options })),
        shippingAddress: v.shipping, billingAddress: v.billingSame ? v.shipping : v.billing,
        deliveryMethod: v.delivery, couponCode: coupon?.code,
      }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? 'Something went wrong. Try again.'); return; }
    setIntent({ clientSecret: data.clientSecret, paymentIntentId: data.paymentIntentId, total: data.totals.total });
  }

  const locked = !!intent;
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
      <div className="space-y-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
          <fieldset disabled={locked} className="space-y-8">
            <section className="panel"><h2 className="mb-4 text-xl font-semibold">Shipping address</h2>
              <AddressFields register={register as never} errors={errors as never} prefix="shipping" /></section>

            <section className="panel"><h2 className="mb-4 text-xl font-semibold">Delivery method</h2>
              <div className="space-y-2">
                {(Object.keys(DELIVERY) as DeliveryMethod[]).map((k) => (
                  <label key={k} className="flex cursor-pointer items-center justify-between rounded-md border border-ink/20 p-3 text-sm has-[:checked]:border-pine has-[:checked]:bg-pine/5">
                    <span className="flex items-center gap-3"><input type="radio" value={k} {...register('delivery')} />
                      <span><strong>{DELIVERY[k].label}</strong> <span className="text-ink/60">{DELIVERY[k].detail}</span></span></span>
                    <span>{money(shippingCost(k, subtotal - discount))}</span>
                  </label>
                ))}
              </div>
            </section>

            <section className="panel"><h2 className="mb-4 text-xl font-semibold">Billing address</h2>
              <label className="mb-4 flex items-center gap-2 text-sm"><input type="checkbox" {...register('billingSame')} /> Same as shipping address</label>
              {!billingSame && <AddressFields register={register as never} errors={errors as never} prefix="billing" />}
            </section>
          </fieldset>

          {!locked && (
            <>
              {error && <p className="field-error" role="alert">{error}</p>}
              <button className="btn btn-primary w-full" disabled={isSubmitting}>{isSubmitting ? 'Preparing payment…' : 'Continue to payment'}</button>
            </>
          )}
        </form>

        {intent && (
          <section className="panel" aria-live="polite">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Payment</h2>
              <button className="btn btn-ghost" onClick={() => setIntent(null)}>Edit details</button>
            </div>
            <PaymentElementWrapper {...intent} />
          </section>
        )}
      </div>

      <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        {!locked && <CouponInput subtotal={subtotal} />}
        <OrderSummary subtotal={subtotal} discount={discount} shipping={shipping}>
          <ul className="space-y-1 border-t border-ink/10 pt-3 text-ink/70">
            {items.map((i) => <li key={i.key} className="flex justify-between"><span>{i.quantity} × {i.title}</span><span>{money(i.price * i.quantity)}</span></li>)}
          </ul>
        </OrderSummary>
      </div>
    </div>
  );
}
