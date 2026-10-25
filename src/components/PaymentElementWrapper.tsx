'use client';
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { money } from '@/lib/utils';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '');

function PayForm({ paymentIntentId, total }: { paymentIntentId: string; total: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true); setError(null);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/checkout/success?session_id=${paymentIntentId}` },
    });
    // Only reached if confirmation fails or needs correction; success redirects.
    setError(error.message ?? 'Payment failed. Check your details and try again.');
    setBusy(false);
  }
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="field-error" role="alert">{error}</p>}
      <button disabled={!stripe || busy} className="btn btn-primary w-full">{busy ? 'Processing…' : `Pay ${money(total)}`}</button>
    </form>
  );
}

export default function PaymentElementWrapper(props: { clientSecret: string; paymentIntentId: string; total: number }) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret: props.clientSecret, appearance: { theme: 'stripe', variables: { colorPrimary: '#0E6B5C' } } }}>
      <PayForm paymentIntentId={props.paymentIntentId} total={props.total} />
    </Elements>
  );
}
