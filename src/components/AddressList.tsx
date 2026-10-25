'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { savedAddressSchema } from '@/lib/validators';
import type { Address } from '@/types';
import AddressFields from './AddressFields';

type Values = z.infer<typeof savedAddressSchema>;

export default function AddressList({ userId, addresses }: { userId: string; addresses: Address[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(savedAddressSchema) as never, defaultValues: { country: 'US', isDefault: false },
  });

  async function onSubmit(v: Values) {
    setError(null);
    if (v.isDefault) await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId);
    const { error } = await supabase.from('addresses').insert({
      user_id: userId, label: v.label || null, full_name: v.fullName, line1: v.line1, line2: v.line2 || null, city: v.city,
      state: v.state || null, postal_code: v.postalCode, country: v.country.toUpperCase(), phone: v.phone || null,
      is_default: v.isDefault || addresses.length === 0,
    });
    if (error) return setError('We couldn’t save that address. Try again.');
    reset(); setAdding(false); router.refresh();
  }
  async function remove(id: string) { await supabase.from('addresses').delete().eq('id', id); router.refresh(); }
  async function makeDefault(id: string) {
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId);
    await supabase.from('addresses').update({ is_default: true }).eq('id', id);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {addresses.length === 0 && !adding && <p className="text-sm text-ink/60">No saved addresses yet. Add one to speed up checkout.</p>}
      <ul className="grid gap-3 sm:grid-cols-2">
        {addresses.map((a) => (
          <li key={a.id} className="panel text-sm">
            <p className="font-semibold">{a.label || a.full_name} {a.is_default && <span className="ml-1 rounded bg-pine/15 px-1.5 text-xs text-pine-dark">Default</span>}</p>
            <p className="mt-1 text-ink/70">{a.full_name}<br />{a.line1}{a.line2 && `, ${a.line2}`}<br />{a.city}{a.state && `, ${a.state}`} {a.postal_code}<br />{a.country}</p>
            <div className="mt-3 flex gap-4">
              {!a.is_default && <button className="underline" onClick={() => makeDefault(a.id)}>Make default</button>}
              <button className="text-red-700 underline" onClick={() => remove(a.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
      {adding ? (
        <form onSubmit={handleSubmit(onSubmit)} className="panel max-w-lg space-y-4" noValidate>
          <div><label className="label" htmlFor="label">Label (optional)</label><input id="label" className="input" placeholder="Home" {...register('label')} /></div>
          <AddressFields register={register as never} errors={errors as never} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register('isDefault')} /> Use as my default address</label>
          {error && <p className="field-error" role="alert">{error}</p>}
          <div className="flex gap-3">
            <button className="btn btn-primary" disabled={isSubmitting}>Save address</button>
            <button type="button" className="btn btn-ghost" onClick={() => setAdding(false)}>Cancel</button>
          </div>
        </form>
      ) : <button className="btn btn-secondary" onClick={() => setAdding(true)}>Add address</button>}
    </div>
  );
}
