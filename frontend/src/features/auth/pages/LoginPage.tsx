import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { BookOpenCheck, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import BrandMark from "@/components/brand/BrandMark";
import { useAuth } from "@/features/auth/context/useAuth";

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login({ email, password });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-shell flex items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl gap-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-700 dark:bg-surface-dark dark:shadow-soft-dark lg:grid-cols-[minmax(0,1fr)_380px] lg:p-8">
        {/* ---- Left: Form ---- */}
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-surface-elevated sm:p-10">
          <BrandMark />
          <h2 className="mt-10 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Sign in
          </h2>
          <p className="mt-2 text-base text-slate-500 dark:text-slate-400">
            Enter your email and password to continue
          </p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="input-field px-5 py-4 text-lg"
                required
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="input-field px-5 py-4 text-lg"
                required
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-primary-700 px-5 py-4 text-lg font-medium text-white transition hover:bg-primary-600 disabled:opacity-60"
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-base text-slate-500 dark:text-slate-400">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-primary-700 transition hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-200"
            >
              Create one
            </Link>
          </p>
        </div>

        {/* ---- Right: Visual sidebar ---- */}
        <aside className="flex flex-col justify-between rounded-[1.75rem] bg-gradient-to-br from-primary-700 to-[#0a2a3c] p-8 text-white shadow-lg dark:from-[#0b3548] dark:to-[#071522] dark:shadow-black/20">
          <div>
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
              <BookOpenCheck className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-3xl font-semibold tracking-tight">Welcome back</h3>
            <p className="mt-4 text-lg leading-relaxed text-white/80">
              Continue your learning journey exactly where you left off.
            </p>

            <div className="mt-10 space-y-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-white/80" />
                <span className="text-base font-medium text-white/90">Secure access</span>
              </div>
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-white/80" />
                <span className="text-base font-medium text-white/90">All progress saved</span>
              </div>
              <div className="flex items-center gap-3">
                <ArrowRight className="h-5 w-5 text-white/80" />
                <span className="text-base font-medium text-white/90">Role‑based dashboard</span>
              </div>
            </div>
          </div>

          <Link
            to="/"
            className="mt-10 inline-flex w-fit items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-medium backdrop-blur transition hover:bg-white/20"
          >
            Back to home
          </Link>
        </aside>
      </div>
    </div>
  );
}

