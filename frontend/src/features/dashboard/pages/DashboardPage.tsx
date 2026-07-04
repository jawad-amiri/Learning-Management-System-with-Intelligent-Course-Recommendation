import { useCallback, useEffect, useState } from "react";
import { BarChart3, BookOpen, CheckCircle2, ImagePlus, Shield, Sparkles, Users, X } from "lucide-react";
import { Link } from "react-router-dom";
import EmptyState from "@/components/ui/empty-state";
import AccessDenied from "@/components/ui/access-denied";
import { getErrorMessage, isForbiddenError } from "@/services/api";
import { toNumber } from "@/lib/format";
import { resolveMediaUrl } from "@/lib/media";
import { useAuth } from "@/features/auth/context/useAuth";
import type { Enrollment, Recommendation, StudentProgress } from "@/types/course";
import type { DashboardCourse, DashboardData } from "@/types/user";
import {
  getDashboardRequest,
  getMyProgressRequest,
  getRecommendationsRequest,
} from "@/features/dashboard/api/dashboard.api";
import { getMyEnrollmentsRequest } from "@/features/enrollment/api/enrollment.api";
import { createCourseRequest } from "@/features/courses/api/courses.api";
import {
  deleteSuperAdminTargetRequest,
  downgradeAdminRequest,
  upgradeUserToAdminRequest,
} from "@/features/admin/api/admin.api";

type StudentExtras = {
  enrollments: Enrollment[];
  progress: StudentProgress[];
  recommendations: Recommendation[];
};

const initialCourseForm = {
  title: "",
  description: "",
  category: "",
  level: "Beginner",
  prerequisite_course_id: "",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [studentExtras, setStudentExtras] = useState<StudentExtras>({
    enrollments: [],
    progress: [],
    recommendations: [],
  });
  const [courseForm, setCourseForm] = useState(initialCourseForm);
  const [courseThumbnail, setCourseThumbnail] = useState<File | null>(null);
  const [courseThumbnailPreview, setCourseThumbnailPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [forbidden, setForbidden] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    setForbidden(false);

    try {
      const dashboard = await getDashboardRequest();
      setData(dashboard);

      if (user?.role === "student") {
        const [enrollmentsResult, progressResult, recommendationsResult] =
          await Promise.allSettled([
            getMyEnrollmentsRequest(),
            getMyProgressRequest(),
            getRecommendationsRequest(),
          ]);

        setStudentExtras({
          enrollments:
            enrollmentsResult.status === "fulfilled" ? enrollmentsResult.value : [],
          progress: progressResult.status === "fulfilled" ? progressResult.value : [],
          recommendations:
            recommendationsResult.status === "fulfilled" ? recommendationsResult.value : [],
        });
      }
    } catch (error) {
      if (isForbiddenError(error)) {
        setForbidden(true);
      } else {
        setError(getErrorMessage(error));
      }
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!courseThumbnail) {
      setCourseThumbnailPreview("");
      return;
    }

    const preview = URL.createObjectURL(courseThumbnail);
    setCourseThumbnailPreview(preview);

    return () => URL.revokeObjectURL(preview);
  }, [courseThumbnail]);

  const handleCreateCourse = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");

    try {
      await createCourseRequest(
        {
          title: courseForm.title,
          description: courseForm.description,
          category: courseForm.category,
          level: courseForm.level,
          prerequisite_course_id: courseForm.prerequisite_course_id
            ? Number(courseForm.prerequisite_course_id)
            : null,
        },
        courseThumbnail,
      );

      setCourseForm(initialCourseForm);
      setCourseThumbnail(null);
      setMessage("Course created successfully.");
      await load();
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const handleSuperAdminAction = async (action: () => Promise<unknown>, successMessage: string) => {
    setBusy(true);
    setError("");
    setMessage("");

    try {
      await action();
      setMessage(successMessage);
      await load();
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  if (forbidden) {
    return <AccessDenied />;
  }

  const cards = getDashboardCards(user?.role, data);
  const rows = user?.role === "student" ? data?.course ?? [] : data?.courses ?? [];

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-950 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-600 dark:border-green-950 dark:bg-green-950/30 dark:text-green-300">
          {message}
        </div>
      ) : null}

      <section className="rounded-[2rem] bg-white p-7 shadow-sm dark:bg-surface-dark">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary-600">
              {user?.role?.replace("_", " ")} dashboard
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-100">
              {getDashboardTitle(user?.role)}
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-500 dark:text-slate-400">
              The widgets and actions below are loaded only from backend-supported routes for this role.
            </p>
          </div>

          {(user?.role === "teacher" || user?.role === "admin") && (
            <div className="rounded-[2rem] bg-primary-600 p-5 text-white shadow-lg">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/15 p-3">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-semibold">Course creation enabled</p>
                  <p className="text-sm text-primary-100">
                    Build new courses using the backend validation rules.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.label}
              className="rounded-[2rem] bg-white p-6 shadow-sm dark:bg-surface-dark"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {card.label}
                </p>
                <div className="rounded-2xl bg-primary-50 p-3 text-primary-600 dark:bg-primary-500/10 dark:text-primary-300">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                {card.value}
              </p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{card.description}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="rounded-[2rem] bg-white p-7 shadow-sm dark:bg-surface-dark">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            {user?.role === "student" ? "Enrolled courses" : "Visible courses"}
          </h2>
          <div className="mt-5 space-y-3">
            {loading ? (
              <p className="text-base text-slate-500 dark:text-slate-400">Loading dashboard data...</p>
            ) : rows.length === 0 ? (
              <EmptyState
                title="No dashboard items"
                description="The backend did not return any recent courses for this role."
              />
            ) : (
              rows.slice(0, 8).map((item) => <DashboardRow key={item.id} item={item} />)
            )}
          </div>
        </section>

        <section className="space-y-4">
          {user?.role === "student" && (
            <>
              <InfoPanel
                title="My enrollments"
                lines={studentExtras.enrollments.slice(0, 4).map((item) => item.title)}
                emptyText="No enrollments returned by the backend yet."
              />
              <InfoPanel
                title="My progress"
                lines={studentExtras.progress.slice(0, 4).map(
                  (item) => `${item.title} - ${item.progress_percent}%`,
                )}
                emptyText="No progress data is available yet."
              />
              <InfoPanel
                title="Recommendations"
                lines={studentExtras.recommendations.slice(0, 4).map((item) => item.title)}
                emptyText="No recommendations were returned."
              />
            </>
          )}

          {(user?.role === "teacher" || user?.role === "admin") && (
            <form
              onSubmit={handleCreateCourse}
              className="rounded-[2rem] bg-white p-6 shadow-sm dark:bg-surface-dark"
            >
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Create course
              </h3>
              <div className="mt-4 space-y-3">
                <input
                  value={courseForm.title}
                  onChange={(event) =>
                    setCourseForm((current) => ({ ...current, title: event.target.value }))
                  }
                  placeholder="Course title"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-slate-900 outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-surface-dark dark:text-slate-100"
                  required
                />
                <textarea
                  value={courseForm.description}
                  onChange={(event) =>
                    setCourseForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Description"
                  className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-slate-900 outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-surface-dark dark:text-slate-100"
                  required
                />
                <input
                  value={courseForm.category}
                  onChange={(event) =>
                    setCourseForm((current) => ({ ...current, category: event.target.value }))
                  }
                  placeholder="Category"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-slate-900 outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-surface-dark dark:text-slate-100"
                  required
                />
                <select
                  value={courseForm.level}
                  onChange={(event) =>
                    setCourseForm((current) => ({ ...current, level: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-slate-900 outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-surface-dark dark:text-slate-100"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
                <input
                  value={courseForm.prerequisite_course_id}
                  onChange={(event) =>
                    setCourseForm((current) => ({
                      ...current,
                      prerequisite_course_id: event.target.value,
                    }))
                  }
                  placeholder="Prerequisite course ID (optional)"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-slate-900 outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-surface-dark dark:text-slate-100"
                />
                <div className="rounded-2xl border border-dashed border-primary-200 bg-primary-50/45 p-4 dark:border-primary-400/25 dark:bg-primary-400/10">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-surface-subtle sm:w-40">
                      {courseThumbnailPreview ? (
                        <img
                          src={courseThumbnailPreview}
                          alt="Course thumbnail preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#0f766e,#164e63)] text-white">
                          <ImagePlus className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Course thumbnail</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                        Upload JPG, PNG, WebP, or GIF. The image appears on course cards, details, dashboard, and recommendations.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-600">
                          <ImagePlus className="h-4 w-4" />
                          {courseThumbnail ? "Change image" : "Upload image"}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            className="sr-only"
                            onChange={(event) => setCourseThumbnail(event.target.files?.[0] ?? null)}
                          />
                        </label>
                        {courseThumbnail ? (
                          <button
                            type="button"
                            onClick={() => setCourseThumbnail(null)}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:text-red-600 dark:border-slate-700 dark:bg-surface-dark dark:text-slate-200"
                          >
                            <X className="h-4 w-4" />
                            Remove
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-base font-medium text-white transition hover:bg-slate-800 disabled:opacity-60 dark:bg-primary-500 dark:hover:bg-primary-400"
                >
                  {busy ? "Saving..." : "Create course"}
                </button>
              </div>
            </form>
          )}

          {user?.role === "admin" && (
            <InfoPanel
              title="Admin tools"
              lines={["Open the Users page to inspect and delete non-admin users."]}
              emptyText=""
              action={
                <Link
                  to="/admin/users"
                  className="inline-flex rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white dark:bg-primary-500"
                >
                  Open users
                </Link>
              }
            />
          )}

          {user?.role === "super_admin" && (
            <SuperAdminPanel
              users={data?.users ?? []}
              busy={busy}
              onUpgrade={(userId) =>
                handleSuperAdminAction(
                  () => upgradeUserToAdminRequest(userId),
                  "User upgraded to admin successfully.",
                )
              }
              onDowngrade={(userId, downgradedTo) =>
                handleSuperAdminAction(
                  () => downgradeAdminRequest(userId, downgradedTo),
                  `Admin downgraded to ${downgradedTo}.`,
                )
              }
              onDeleteAdmin={(userId) =>
                handleSuperAdminAction(
                  () => deleteSuperAdminTargetRequest(userId),
                  "Admin deleted successfully.",
                )
              }
            />
          )}
        </section>
      </section>
    </div>
  );
}

function DashboardRow({ item }: { item: DashboardCourse }) {
  const thumbnail = resolveMediaUrl(item.thumbnail_url || item.image_url);

  return (
    <div className="flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-surface-dark sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <div className="h-16 w-20 shrink-0 overflow-hidden rounded-2xl bg-primary-700 text-white">
          {thumbnail ? (
            <img src={thumbnail} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#0f766e,#164e63)]">
              <BookOpen className="h-6 w-6" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">
            {item.title}
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {item.teacher_name ? `Teacher: ${item.teacher_name}` : "Dashboard item"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
          {item.progress_percent !== undefined
            ? `${toNumber(item.progress_percent)}% progress`
            : item.status ?? "active"}
        </div>
        <Link
          to={`/courses/${item.id}`}
          className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-blue-700 shadow-sm dark:bg-slate-800 dark:text-primary-200"
        >
          Open
        </Link>
      </div>
    </div>
  );
}

function InfoPanel({
  title,
  lines,
  emptyText,
  action,
}: {
  title: string;
  lines: string[];
  emptyText: string;
  action?: React.ReactNode;
}) {
  return (
    <article className="rounded-[2rem] bg-white p-6 shadow-sm dark:bg-surface-dark">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        {action}
      </div>
      <div className="mt-4 space-y-3">
        {lines.length === 0 ? (
          emptyText ? <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">{emptyText}</p> : null
        ) : (
          lines.map((line) => (
            <div
              key={line}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-surface-dark dark:text-slate-300"
            >
              {line}
            </div>
          ))
        )}
      </div>
    </article>
  );
}

function SuperAdminPanel({
  users,
  busy,
  onUpgrade,
  onDowngrade,
  onDeleteAdmin,
}: {
  users: DashboardData["users"];
  busy: boolean;
  onUpgrade: (userId: number) => void;
  onDowngrade: (userId: number, downgradedTo: "student" | "teacher") => void;
  onDeleteAdmin: (userId: number) => void;
}) {
  return (
    <article className="rounded-[2rem] bg-white p-6 shadow-sm dark:bg-surface-dark">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-blue-50 p-3 text-blue-600 dark:bg-primary-400/12 dark:text-primary-200">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Super admin controls
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Powered by `/api/dashboard` data plus super-admin action routes.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {(users ?? []).slice(0, 10).map((item) => (
          <div
            key={item.id}
            className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-surface-dark"
          >
            <div className="flex flex-col gap-3">
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{item.full_name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{item.email}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                  {item.role_name ?? "unknown"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onUpgrade(item.id)}
                  className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-primary-500"
                >
                  Upgrade
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onDowngrade(item.id, "student")}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-60 dark:border-slate-700 dark:bg-surface-dark dark:text-slate-200"
                >
                  To student
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onDowngrade(item.id, "teacher")}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-60 dark:border-slate-700 dark:bg-surface-dark dark:text-slate-200"
                >
                  To teacher
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onDeleteAdmin(item.id)}
                  className="rounded-xl bg-red-500 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  Delete admin
                </button>
              </div>
            </div>
          </div>
        ))}

        {(users ?? []).length === 0 && (
          <EmptyState
            title="No user rows returned"
            description="The super admin dashboard did not return any users."
          />
        )}
      </div>
    </article>
  );
}

function getDashboardTitle(role: string | undefined) {
  switch (role) {
    case "student":
      return "Track progress, continue lessons, and explore recommendations.";
    case "teacher":
      return "Manage your courses and keep lesson delivery moving.";
    case "admin":
      return "Oversee course activity and maintain the learning platform.";
    case "super_admin":
      return "Control user elevation, admin governance, and global oversight.";
    default:
      return "Learning dashboard";
  }
}

function getDashboardCards(role: string | undefined, data: DashboardData | null) {
  if (role === "student") {
    return [
      {
        label: "Courses",
        value: data?.total_courses ?? 0,
        description: "Enrolled course count.",
        icon: BookOpen,
      },
      {
        label: "Completed",
        value: data?.completed_courses ?? 0,
        description: "Completed course count.",
        icon: CheckCircle2,
      },
      {
        label: "Watched",
        value: (data?.course ?? []).reduce(
          (sum, item) => sum + toNumber(item.videos_watched),
          0,
        ),
        description: "Watched video entries.",
        icon: BarChart3,
      },
      {
        label: "Active",
        value: (data?.course ?? []).filter((item) => !item.is_completed).length,
        description: "Courses still in progress.",
        icon: Users,
      },
    ];
  }

  if (role === "teacher") {
    return [
      {
        label: "Courses",
        value: data?.total_courses ?? 0,
        description: "Teacher course count.",
        icon: BookOpen,
      },
      {
        label: "Students",
        value: data?.total_students ?? 0,
        description: "Enrolled students total.",
        icon: Users,
      },
      {
        label: "Active",
        value: (data?.courses ?? []).filter((item) => item.status === "active").length,
        description: "Active courses.",
        icon: CheckCircle2,
      },
      {
        label: "Tracked",
        value: (data?.courses ?? []).length,
        description: "Tracked course rows.",
        icon: BarChart3,
      },
    ];
  }

  if (role === "admin") {
    return [
      {
        label: "Users",
        value: data?.total_users ?? 0,
        description: "Users returned by backend.",
        icon: Users,
      },
      {
        label: "Courses",
        value: (data?.courses ?? []).length,
        description: "Visible course rows.",
        icon: BookOpen,
      },
      {
        label: "Active",
        value: data?.activeCourses ?? 0,
        description: "Active course count.",
        icon: CheckCircle2,
      },
      {
        label: "Admin",
        value: "Ready",
        description: "Admin course management enabled.",
        icon: Shield,
      },
    ];
  }

  return [
    {
      label: "Users",
      value: data?.total_users ?? 0,
      description: "Users returned by backend.",
      icon: Users,
    },
    {
      label: "Courses",
      value: data?.total_courses ?? (data?.courses ?? []).length,
      description: "Available course count.",
      icon: BookOpen,
    },
    {
      label: "Oversight",
      value: "Global",
      description: "Super admin platform control.",
      icon: Shield,
    },
    {
      label: "Tracked",
      value: (data?.courses ?? []).length,
      description: "Rows in dashboard feed.",
      icon: BarChart3,
    },
  ];
}

