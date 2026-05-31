import Link from "next/link";
import { login } from "@/app/auth/action";
import { AuthShell } from "@/components/auth/auth";
import { PasswordField } from "@/components/auth/password";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;
  const error = params.error;
  const message = params.message;

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to access Chainventory records, reports, and permit monitoring tools."
      footerText="Don't have an account?"
      footerLinkText="Register here"
      footerHref="/register"
    >
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900">Login</h2>
        <p className="mt-2 text-sm text-slate-500">
          Enter your DENR account credentials.
        </p>

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {message}
          </div>
        ) : null}

        <form action={login} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Email Address
            </label>
            <input
              name="email"
              type="email"
              placeholder="name@denr.gov.ph"
              className="field"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Password
            </label>
            <PasswordField />
          </div>

          <button type="submit" className="btn-teal w-full">
            Log In
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-slate-500">
          <Link
            href="/"
            className="font-medium text-slate-700 hover:text-slate-900"
          >
            Back to home
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}