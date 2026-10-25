import AuthForm from '@/components/AuthForm';
export const metadata = { title: 'Create account' };
const safe = (n?: string) => (n && n.startsWith("/") && !n.startsWith("//") ? n : "/account");
export default function SignUp({ searchParams }: { searchParams: { next?: string } }) {
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-6 text-3xl font-semibold">Create your account</h1>
      <AuthForm mode="signup" next={safe(searchParams.next)} />
    </div>
  );
}
