import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Clock3, PlayCircle, UserRound } from "lucide-react";
import type { Course } from "@/types/course";
import { resolveMediaUrl } from "@/lib/media";
import { useAuth } from "@/features/auth/context/useAuth";

function getCourseImage(course: Course) {
  return resolveMediaUrl(course.thumbnail_url || course.image_url);
}

export default function CourseCard({ course }: { course: Course }) {
  const { user } = useAuth();
  const teacherName = course.teacher_name || course.full_name;
  const imageUrl = getCourseImage(course);
  const teacherPhoto = resolveMediaUrl(course.teacher_profile_photo_url);
  const canManageCourse =
    user?.role === "admin" ||
    user?.role === "super_admin" ||
    (user?.role === "teacher" && (!course.teacher_id || Number(course.teacher_id) === Number(user.id)));

  return (
    <article className="group liquid-card flex h-full flex-col rounded-[1.75rem] p-3 hover:-translate-y-1 hover:border-primary-200 dark:hover:border-primary-400/35">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[1.35rem] bg-slate-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={course.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_25%_20%,rgba(45,212,191,0.35),transparent_30%),linear-gradient(135deg,#0f766e,#164e63_55%,#0f172a)]">
            <div className="liquid-glass flex h-20 w-20 items-center justify-center rounded-[1.4rem] text-white shadow-2xl">
              <BookOpen className="h-9 w-9" />
            </div>
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
        <div className="absolute bottom-3 left-3 right-3">
          <span className="liquid-glass inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-white">
            <PlayCircle className="h-4 w-4" />
            {course.category}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-2 pb-2 pt-5">
        <h3 className="text-xl font-semibold leading-tight text-slate-950 dark:text-white">{course.title}</h3>
        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
          {course.description || "Course details will appear here as the teacher builds the course."}
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <Link to={course.teacher_id ? `/teachers/${course.teacher_id}` : `/courses/${course.id}`} className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/70 bg-white/55 px-4 py-3 shadow-sm backdrop-blur-md transition hover:border-primary-200 dark:border-primary-200/10 dark:bg-white/5">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-primary-50 text-primary-700 shadow-sm dark:bg-primary-400/10 dark:text-primary-200">
              {teacherPhoto ? <img src={teacherPhoto} alt={teacherName || "Instructor"} className="h-full w-full object-cover" /> : <UserRound className="h-4 w-4" />}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Instructor</p>
              <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                {teacherName || "BAMIKA teacher"}
              </p>
            </div>
          </Link>
          <div className="hidden items-center gap-2 rounded-2xl border border-white/70 bg-white/45 px-4 py-3 text-xs font-semibold text-slate-500 shadow-sm backdrop-blur-md dark:border-primary-200/10 dark:bg-white/5 dark:text-slate-300 sm:flex">
            <Clock3 className="h-4 w-4 text-primary-600 dark:text-primary-300" />
            Self paced
          </div>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <Link
            to={`/courses/${course.id}`}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-800/20 transition hover:bg-primary-600"
          >
            View course
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
          {canManageCourse ? (
            <Link
              to={`/courses/${course.id}/edit`}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-primary-200 bg-white/70 px-4 py-3 text-sm font-semibold text-primary-800 transition hover:border-primary-300 hover:bg-primary-50 dark:border-primary-400/20 dark:bg-white/5 dark:text-primary-100"
            >
              Manage
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
