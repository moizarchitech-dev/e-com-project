'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { profileSchema } from '@/lib/validators';

type Values = z.infer<typeof profileSchema>;

export default function ProfileForm({ userId, email, defaults }: { userId: string; email: string; defaults: Values }) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(profileSchema), defaultValues: defaults });

  async function onSubmit(v: Values) {
    const { error } = await createClient().from('profiles').update({ full_name: v.fullName, phone: v.phone || null }).eq('id', userId);
    setMsg(error ? 'We couldn’t save your changes. Try again.' : 'Profile saved.');
    router.refresh();
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="panel max-w-lg space-y-4" noValidate>
      <div><label className="label" htmlFor="email">Email</label><input id="email" className="input" value={email} disabled readOnly /></div>
      <div><label className="label" htmlFor="fullName">Full name</label><input id="fullName" className="input" {...register('fullName')} />
        {errors.fullName && <p className="field-error" role="alert">{errors.fullName.message}</p>}</div>
      <div><label className="label" htmlFor="phone">Phone</label><input id="phone" className="input" autoComplete="tel" {...register('phone')} /></div>
      <div className="flex items-center gap-3">
        <button className="btn btn-primary" disabled={isSubmitting}>Save profile</button>
        {msg && <p className="text-sm" role="status">{msg}</p>}
      </div>
    </form>
  );
}
