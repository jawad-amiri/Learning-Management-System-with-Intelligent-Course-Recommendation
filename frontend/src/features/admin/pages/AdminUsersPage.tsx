import { useEffect, useState } from "react";
import { ChevronDown, Shield, Users } from "lucide-react";
import { api, getErrorMessage } from "@/services/api";
import { extractResponseData } from "@/services/response";
import { formatDate } from "@/lib/format";

type AdminUser = {
  id: number;
  full_name: string;
  email: string;
  role_id?: number;
  created_at?: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [usersOpen, setUsersOpen] = useState(true);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get("/admin/users");
        const nextUsers = extractResponseData<AdminUser[]>(response.data);

        if (!ignore) {
          setUsers(nextUsers);
        }
      } catch (err) {
        if (!ignore) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <section className="surface-card p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary-600 dark:text-primary-300">
              Admin Users
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Inspect the platform user list with stable backend data.
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
              This page is wired to `/api/admin/users` and keeps the UI read-only and safe.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600 dark:bg-surface-subtle dark:text-slate-300">
            <Shield className="h-4 w-4 text-primary-600 dark:text-primary-300" />
            Admin and super admin only
          </div>
        </div>
      </section>

      {loading ? (
        <section className="surface-card p-7">
          <div className="h-72 animate-pulse rounded-[24px] bg-slate-100 dark:bg-surface-subtle" />
        </section>
      ) : error ? (
        <section className="rounded-[2rem] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
          {error}
        </section>
      ) : (
        <section className="surface-card overflow-hidden">
          <button
            type="button"
            onClick={() => setUsersOpen((current) => !current)}
            className="flex w-full items-center justify-between gap-4 border-b border-slate-200 px-6 py-5 text-left dark:border-slate-700"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-400/12 dark:text-primary-200">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Users</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{users.length} user record(s) loaded</p>
              </div>
            </div>
            <ChevronDown className={usersOpen ? "h-5 w-5 rotate-180 text-slate-400 transition" : "h-5 w-5 text-slate-400 transition"} />
          </button>

          {usersOpen ? <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500 dark:bg-surface-subtle dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role ID</th>
                  <th className="px-6 py-4">Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-slate-100 bg-white dark:border-slate-700 dark:bg-surface-dark">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-slate-100">{user.full_name}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{user.role_id ?? "N/A"}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{formatDate(user.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div> : null}
        </section>
      )}
    </div>
  );
}
