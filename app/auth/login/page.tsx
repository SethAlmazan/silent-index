import { login } from "../action";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="mb-2 text-3xl font-bold">Chainventory Login</h1>

        <p className="mb-6 text-slate-500">
          Sign in to continue
        </p>

        <form action={login} className="space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="w-full rounded-2xl border p-4"
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            className="w-full rounded-2xl border p-4"
            required
          />

          <button
            type="submit"
            className="w-full rounded-2xl bg-teal-600 p-4 font-semibold text-white"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}