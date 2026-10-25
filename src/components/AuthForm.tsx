'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { signInSchema, signUpSchema } from '@/lib/validators';

type Values = z.infer<typeof signUpSchema>;

export default function AuthForm({ mode, next }: { mode: 'signin' | 'signup'; next: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const isSignUp = mode === 'signup';
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(isSignUp ? signUpSchema : signInSchema) as never,
  });
  const callback = () => `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  async function onSubmit(v: Values) {
    setError(null);
    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email: v.email, password: v.password, options: { data: { full_name: v.fullName }, emailRedirectTo: callback() },
      });
      if (error) return setError(error.message);
      if (!data.session) return setNotice('Check your email for a confirmation link to finish creating your account.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: v.email, password: v.password });
      if (error) return setError('That email and password don’t match.');
    }
    router.push(next);
    router.refresh();
  }

  async function google() {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: callback() } });
    if (error) setError(error.message);
  }

  if (notice) return <p className="panel" role="status">{notice}</p>;
  return (
    <div className="space-y-5">
      <button type="button" onClick={google} className="btn btn-secondary w-full">Continue with Google</button>
      <p className="text-center text-xs text-ink/50">or use your email</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {isSignUp && (
          <div><label htmlFor="fullName" className="label">Full name</label>
            <input id="fullName" className="input" autoComplete="name" {...register('fullName')} />
            {errors.fullName && <p className="field-error" role="alert">{errors.fullName.message}</p>}</div>
        )}
        <div><label htmlFor="email" className="label">Email</label>
          <input id="email" type="email" className="input" autoComplete="email" {...register('email')} />
          {errors.email && <p className="field-error" role="alert">{errors.email.message}</p>}</div>
        <div><label htmlFor="password" className="label">Password</label>
          <input id="password" type="password" className="input" autoComplete={isSignUp ? 'new-password' : 'current-password'} {...register('password')} />
          {errors.password && <p className="field-error" role="alert">{errors.password.message}</p>}</div>
        {error && <p className="field-error" role="alert">{error}</p>}
        <button className="btn btn-primary w-full" disabled={isSubmitting}>{isSignUp ? 'Create account' : 'Sign in'}</button>
      </form>
      <p className="text-center text-sm">
        {isSignUp ? <>Already have an account? <Link className="font-semibold text-pine underline" href={`/signin?next=${encodeURIComponent(next)}`}>Sign in</Link></>
          : <>New here? <Link className="font-semibold text-pine underline" href={`/signup?next=${encodeURIComponent(next)}`}>Create an account</Link></>}
      </p>
    </div>
  );
}
