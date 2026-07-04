import { useEffect, useMemo, useState } from "react";
import { Award, BarChart3, BookOpen, Users } from "lucide-react";
import EmptyState from "@/components/ui/empty-state";
import { getDashboardRequest, getMyProgressRequest } from "@/features/dashboard/api/dashboard.api";
import { useAuth } from "@/features/auth/context/useAuth";
import { getErrorMessage } from "@/services/api";
import { toNumber } from "@/lib/format";
import type { StudentProgress } from "@/types/course";
import type { DashboardCourse } from "@/types/user";

export default function MyProgressPage() {
  const { user } = useAuth();
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([]);
  const [teacherCourses, setTeacherCourses] = useState<DashboardCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        if (user?.role === "teacher") {
          const dashboard = await getDashboardRequest();
          if (mounted) setTeacherCourses(dashboard.courses ?? []);
        } else {
          const progress = await getMyProgressRequest();
          if (mounted) setStudentProgress(progress);
        }
      } catch (err) {
        if (mounted) setError(getErrorMessage(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [user?.role]);

  const teacherAverage = useMemo(() => {
    if (teacherCourses.length === 0) return 0;
    return Math.round(
      teacherCourses.reduce((sum, course) => sum + toNumber(course.avg_progress), 0) /
        teacherCourses.length,
    );
  }, [teacherCourses]);

  const studentAverage = useMemo(() => {
    if (studentProgress.length === 0) return 0;
    return Math.round(
      studentProgress.reduce((sum, item) => sum + toNumber(item.progress_percent), 0) /
        studentProgress.length,
    );
  }, [studentProgress]);

  if (loading) {
    return <div className="rounded-[2rem] bg-white p-8 text-slate-500 shadow-sm">Loading progress...</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-white p-7 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary-700">
          {user?.role === "teacher" ? "Course progress" : "My progress"}
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">
          {user?.role === "teacher"
            ? "Progress overview from your course enrollments."
            : "Track your learning completion."}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {user?.role === "teacher"
            ? "The backend dashboard returns enrolled student counts and average progress for your courses."
            : "Progress is loaded from the student progress endpoint."}
        </p>
      </section>

      {error ? (
        <div className="rounded-[2rem] border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error}</div>
      ) : null}

      {user?.role === "teacher" ? (
        <TeacherProgress courses={teacherCourses} average={teacherAverage} />
      ) : (
        <StudentProgressView progress={studentProgress} average={studentAverage} />
      )}
    </div>
  );
}

function TeacherProgress({ courses, average }: { courses: DashboardCourse[]; average: number }) {
  const totalStudents = courses.reduce((sum, course) => sum + toNumber(course.enrolled_students), 0);

  return (
    <>
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard icon={BookOpen} label="Courses" value={courses.length} />
        <MetricCard icon={Users} label="Enrolled students" value={totalStudents} />
        <MetricCard icon={BarChart3} label="Average progress" value={`${average}%`} />
      </section>

      <section className="rounded-[2rem] bg-white p-7 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Course progress</h2>
        <div className="mt-5 space-y-3">
          {courses.length === 0 ? (
            <EmptyState title="No course progress" description="No teacher course rows were returned." />
          ) : (
            courses.map((course) => {
              const progress = toNumber(course.avg_progress);
              return (
                <article key={course.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">{course.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {toNumber(course.enrolled_students)} enrolled students
                      </p>
                    </div>
                    <span className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-primary-700">
                      {progress}%
                    </span>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
                    <div className="h-full rounded-full bg-primary-600" style={{ width: `${progress}%` }} />
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </>
  );
}

function StudentProgressView({ progress, average }: { progress: StudentProgress[]; average: number }) {
  const completed = progress.filter((item) => toNumber(item.progress_percent) === 100).length;

  return (
    <>
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard icon={BookOpen} label="Courses" value={progress.length} />
        <MetricCard icon={Award} label="Completed" value={completed} />
        <MetricCard icon={BarChart3} label="Average progress" value={`${average}%`} />
      </section>

      <section className="rounded-[2rem] bg-white p-7 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Course progress</h2>
        <div className="mt-5 space-y-3">
          {progress.length === 0 ? (
            <EmptyState title="No progress yet" description="No student progress rows were returned." />
          ) : (
            progress.map((item) => {
              const value = toNumber(item.progress_percent);
              return (
                <article key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-slate-900">{item.title}</h3>
                    <span className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-primary-700">
                      {value}%
                    </span>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
                    <div className="h-full rounded-full bg-primary-600" style={{ width: `${value}%` }} />
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BookOpen;
  label: string;
  value: string | number;
}) {
  return (
    <article className="rounded-[2rem] bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className="rounded-2xl bg-primary-50 p-3 text-primary-700">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 text-3xl font-semibold text-slate-900">{value}</p>
    </article>
  );
}

