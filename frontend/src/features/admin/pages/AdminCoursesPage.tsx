import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, ChevronDown, Search, Trash2, UserRound } from "lucide-react";
import { deleteCourseRequest, getCoursesRequest } from "@/features/courses/api/courses.api";
import { getErrorMessage } from "@/services/api";
import EmptyState from "@/components/ui/empty-state";
import type { Course } from "@/types/course";
import { resolveMediaUrl } from "@/lib/media";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [catalogOpen, setCatalogOpen] = useState(true);
  const [error, setError] = useState("");

  const loadCourses = async () => {
    setLoading(true);
    setError("");

    try {
      setCourses(await getCoursesRequest());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    const value = searchQuery.trim().toLowerCase();
    if (!value) return courses;

    return courses.filter((course) =>
      [course.title, course.description, course.category, course.level, course.teacher_name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(value),
    );
  }, [courses, searchQuery]);

  const handleDelete = async (courseId: number) => {
    if (!window.confirm("Delete this course? This uses the backend admin delete route.")) return;

    setDeletingId(courseId);
    setError("");

    try {
      await deleteCourseRequest(courseId);
      setCourses((current) => current.filter((course) => course.id !== courseId));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-700 dark:bg-surface-dark">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <button type="button" onClick={() => setCatalogOpen((current) => !current)} className="flex flex-1 items-start justify-between gap-4 text-left">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary-700 dark:text-primary-300">
                Admin courses
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
                Manage course catalog
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Course cards use the same clean card language as the login screens and only call supported backend routes.
              </p>
            </div>
            <ChevronDown className={catalogOpen ? "mt-2 h-5 w-5 rotate-180 text-slate-400 transition" : "mt-2 h-5 w-5 text-slate-400 transition"} />
          </button>

          {catalogOpen ? <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search courses"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-primary-600 dark:border-slate-700 dark:bg-surface-dark dark:text-white"
            />
          </div> : null}
        </div>
      </section>

      {error ? (
        <div className="rounded-[2rem] border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      ) : null}

      {!catalogOpen ? null : loading ? (
        <div className="rounded-[2rem] bg-white p-8 text-slate-500 shadow-sm dark:bg-surface-dark dark:text-slate-400">
          Loading courses...
        </div>
      ) : filteredCourses.length === 0 ? (
        <EmptyState title="No courses found" description="The backend returned no courses matching this filter." />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredCourses.map((course) => (
            <AdminCourseCard
              key={course.id}
              course={course}
              deleting={deletingId === course.id}
              onDelete={() => void handleDelete(course.id)}
            />
          ))}
        </section>
      )}
    </div>
  );
}

function AdminCourseCard({
  course,
  deleting,
  onDelete,
}: {
  course: Course;
  deleting: boolean;
  onDelete: () => void;
}) {
  const teacherName = course.teacher_name || course.full_name;
  const imageUrl = resolveMediaUrl(course.thumbnail_url || course.image_url);

  return (
    <article className="group liquid-card flex h-full flex-col rounded-[1.75rem] p-3 hover:-translate-y-1 hover:border-primary-200 dark:hover:border-primary-400/35">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[1.35rem] bg-slate-100">
        {imageUrl ? (
          <img src={imageUrl} alt={course.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_25%_20%,rgba(45,212,191,0.35),transparent_30%),linear-gradient(135deg,#0f766e,#164e63_55%,#0f172a)] text-white">
            <BookOpen className="h-10 w-10" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/72 via-slate-950/12 to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="liquid-glass rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-sm">
            {course.status ?? "active"}
          </span>
          <span className="liquid-glass rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-sm">
            {course.level}
          </span>
        </div>
        <span className="liquid-glass absolute bottom-3 left-3 rounded-full px-3 py-2 text-xs font-semibold text-white">
          {course.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col px-2 pb-2 pt-5">
        <h2 className="text-xl font-semibold leading-tight text-slate-950 dark:text-white">{course.title}</h2>
        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
          {course.description}
        </p>

        {teacherName ? (
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/70 bg-white/55 px-4 py-3 shadow-sm backdrop-blur-md dark:border-primary-200/10 dark:bg-white/5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-700 shadow-sm dark:bg-primary-400/10 dark:text-primary-200">
              <UserRound className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Instructor</p>
              <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{teacherName}</p>
            </div>
          </div>
        ) : null}

        <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] gap-3">
          <Link
            to={`/courses/${course.id}`}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-600"
          >
            View course
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100 disabled:opacity-60 dark:border-red-950 dark:bg-red-950/30 dark:text-red-300"
            aria-label="Delete course"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
