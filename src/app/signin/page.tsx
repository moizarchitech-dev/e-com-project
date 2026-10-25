import AuthForm from '@/components/AuthForm';
export const metadata = { title: 'Sign in' };
const safe = (n?: string) => (n && n.startsWith("/") && !n.startsWith("//") ? n : "/account");
export default function SignIn({ searchParams }: { searchParams: { next?: string; error?: string } }) {
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-6 text-3xl font-semibold">Sign in</h1>
      {searchParams.error && <p className="field-error mb-4" role="alert">Sign-in didn’t complete. Try again.</p>}
      <AuthForm mode="signin" next={safe(searchParams.next)} />
    </div>
  );
}
