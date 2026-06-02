import { signup } from "@/app/auth/action";
import { AuthShell } from "@/components/auth/auth";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params.error;

  return (
    <AuthShell
      title="Create an account"
      subtitle="Register authorized personnel so they can access Chainventory securely."
      footerText="Already have an account?"
      footerLinkText="Log in here"
      footerHref="/login"
    >
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900">Register</h2>
        <p className="mt-2 text-sm text-slate-500">
          Create a new account for system access.
        </p>

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        ) : null}

        <form action={signup} className="mt-6 space-y-4">
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
            <input
              name="password"
              type="password"
              placeholder="Enter password"
              className="field"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Confirm Password
            </label>
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm password"
              className="field"
              required
            />
          </div>

          <button type="submit" className="btn-primary w-full">
            Create Account
          </button>
        </form>
      </div>
    </AuthShell>
  );
}