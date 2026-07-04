import { useEffect, useMemo, useState } from "react";
import CourseCard from "@/features/courses/components/CourseCard";
import { getCoursesRequest } from "@/features/courses/api/courses.api";
import { getErrorMessage, isForbiddenError } from "@/services/api";
import type { Course } from "@/types/course";
import EmptyState from "@/components/ui/empty-state";
import AccessDenied from "@/components/ui/access-denied";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError("");
      setForbidden(false);

      try {
        const nextCourses = await getCoursesRequest();
        if (mounted) {
          setCourses(nextCourses);
        }
      } catch (error) {
        if (!mounted) {
          return;
        }

        if (isForbiddenError(error)) {
          setForbidden(true);
        } else {
          setError(getErrorMessage(error));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredCourses = useMemo(() => {
    const value = search.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesSearch = !value || [course.title, course.description, course.category, course.level]
        .join(" ")
        .toLowerCase()
        .includes(value);
      const matchesCategory = category === "all" || course.category === category;
      const matchesLevel = level === "all" || course.level === level;

      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [courses, search, category, level]);

  const categories = useMemo(
    () => Array.from(new Set(courses.map((course) => course.category).filter(Boolean))),
    [courses],
  );

  if (forbidden) {
    return <AccessDenied />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-white p-6 shadow-sm dark:bg-surface-dark">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Courses</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Browse all courses available from the backend course endpoint.
            </p>
          </div>
          <div className="grid w-full gap-3 sm:grid-cols-3 lg:max-w-3xl">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search courses"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-surface-dark dark:text-white"
            />
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-surface-dark dark:text-white"
            >
              <option value="all">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <select
              value={level}
              onChange={(event) => setLevel(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-surface-dark dark:text-white"
            >
              <option value="all">All levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
          {error}
        </div>
      ) : loading ? (
        <div className="rounded-2xl bg-white p-6 text-sm text-slate-500 shadow-sm dark:bg-surface-dark dark:text-slate-400">
          Loading courses...
        </div>
      ) : filteredCourses.length === 0 ? (
        <EmptyState
          title="No courses found"
          description="The backend did not return any matching courses."
        />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </section>
      )}
    </div>
  );
}
