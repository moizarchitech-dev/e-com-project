import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { Address, Profile } from '@/types';
import ProfileForm from '@/components/ProfileForm';
import AddressList from '@/components/AddressList';

export const metadata = { title: 'Account settings' };

export default async function AccountPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/signin?next=/account');
  const [{ data: profile }, { data: addresses }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase.from('addresses').select('*').order('is_default', { ascending: false }).order('created_at'),
  ]);
  const p = profile as Profile | null;
  return (
    <div className="space-y-12">
      <section><h2 className="mb-4 text-2xl font-semibold">Profile</h2>
        <ProfileForm userId={user.id} email={user.email ?? ''} defaults={{ fullName: p?.full_name ?? '', phone: p?.phone ?? '' }} /></section>
      <section><h2 className="mb-4 text-2xl font-semibold">Saved addresses</h2>
        <AddressList userId={user.id} addresses={(addresses ?? []) as Address[]} /></section>
    </div>
  );
}
