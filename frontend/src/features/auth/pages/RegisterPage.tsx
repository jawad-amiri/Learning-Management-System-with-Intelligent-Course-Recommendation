import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { GraduationCap, Presentation, UserPlus, LayoutDashboard } from "lucide-react";
import { registerRequest } from "@/features/auth/api/auth.api";
import { getErrorMessage } from "@/services/api";
import BrandMark from "@/components/brand/BrandMark";
import { useAuth } from "@/features/auth/context/useAuth";

export default function RegisterPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "student" as "student" | "teacher",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await registerRequest(form);
      navigate("/login", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
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
          <h1 className="mt-10 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Create account
          </h1>
          <p className="mt-2 text-base text-slate-500 dark:text-slate-400">
            Join BAMIKA LMS as a student or teacher
          </p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <input
              value={form.full_name}
              onChange={(e) => setForm((c) => ({ ...c, full_name: e.target.value }))}
              placeholder="Full name"
              className="input-field px-5 py-4 text-lg"
              required
            />
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))}
              placeholder="Email"
              className="input-field px-5 py-4 text-lg"
              required
            />
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((c) => ({ ...c, password: e.target.value }))}
              placeholder="Password"
              className="input-field px-5 py-4 text-lg"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              {[
                { role: "student" as const, label: "Student", icon: GraduationCap },
                { role: "teacher" as const, label: "Teacher", icon: Presentation },
              ].map((item) => {
                const Icon = item.icon;
                const active = form.role === item.role;
                return (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => setForm((c) => ({ ...c, role: item.role }))}
                    className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-5 text-lg font-medium transition ${
                      active
                        ? "border-primary-700 bg-primary-50 text-primary-700 shadow-sm dark:border-primary-400 dark:bg-primary-500/10 dark:text-primary-300"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-primary-300 dark:border-slate-700 dark:bg-surface-dark dark:text-slate-400"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                    {item.label}
                  </button>
                );
              })}
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-primary-700 px-5 py-4 text-lg font-medium text-white transition hover:bg-primary-600 disabled:opacity-60 dark:bg-primary-400 dark:text-slate-950 dark:hover:bg-primary-300"
            >
              {submitting ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-base text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-primary-700 transition hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-200"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* ---- Right: Visual sidebar ---- */}
        <aside className="flex flex-col justify-between rounded-[1.75rem] bg-gradient-to-br from-primary-700 to-[#0a2a3c] p-8 text-white shadow-lg dark:from-[#0b3548] dark:to-[#071522] dark:shadow-black/20">
          <div>
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
              <UserPlus className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-3xl font-semibold tracking-tight">Start your journey</h3>
            <p className="mt-4 text-lg leading-relaxed text-white/80">
              Choose your role and unlock the full learning management experience.
            </p>

            <div className="mt-10 space-y-4">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-5 w-5 text-white/80" />
                <span className="text-base font-medium text-white/90">Student dashboard</span>
              </div>
              <div className="flex items-center gap-3">
                <Presentation className="h-5 w-5 text-white/80" />
                <span className="text-base font-medium text-white/90">Teacher tools</span>
              </div>
              <div className="flex items-center gap-3">
                <LayoutDashboard className="h-5 w-5 text-white/80" />
                <span className="text-base font-medium text-white/90">Role‑based access</span>
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

