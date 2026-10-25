import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import type { Address } from '@/types';
import CheckoutForm from '@/components/CheckoutForm';

export const metadata: Metadata = { title: 'Checkout' };

export default async function CheckoutPage() {
  const supabase = createClient();
  const { data } = await supabase.from('addresses').select('*').order('is_default', { ascending: false }).limit(1);
  const a = (data?.[0] ?? null) as Address | null;
  const defaultAddress = a && {
    fullName: a.full_name, line1: a.line1, line2: a.line2 ?? undefined, city: a.city, state: a.state ?? undefined,
    postalCode: a.postal_code, country: a.country, phone: a.phone ?? undefined,
  };
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-8 text-4xl font-semibold">Checkout</h1>
      <CheckoutForm defaultAddress={defaultAddress} />
    </div>
  );
}
