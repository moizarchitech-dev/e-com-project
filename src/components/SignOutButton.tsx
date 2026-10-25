'use client';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SignOutButton() {
  const router = useRouter();
  return (
    <button
      className="hover:text-pine"
      onClick={async () => { await createClient().auth.signOut(); router.push('/'); router.refresh(); }}
    >Sign out</button>
  );
}
