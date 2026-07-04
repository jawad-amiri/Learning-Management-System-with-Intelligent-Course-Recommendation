// NEW - PROFILE PHOTO FEATURE: read-only public teacher profile page.
import { useEffect, useState } from "react";
import type React from "react";
import { Award, BookOpen, GraduationCap, Users } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { getPublicTeacherProfileRequest } from "@/features/auth/api/auth.api";
import BackButton from "@/components/ui/back-button";
import { getErrorMessage } from "@/services/api";
import { resolveMediaUrl } from "@/lib/media";
import type { PublicTeacherProfile } from "@/types/user";

export default function TeacherProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState<PublicTeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!id) return;

      setLoading(true);
      setError("");

      try {
        const nextProfile = await getPublicTeacherProfileRequest(id);
        if (mounted) setProfile(nextProfile);
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
  }, [id]);

  if (loading) {
    return <div className="rounded-[2rem] bg-white p-8 text-slate-500 shadow-sm dark:bg-surface-dark">Loading teacher profile...</div>;
  }

  if (error || !profile) {
    return <div className="rounded-[2rem] border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error || "Teacher not found"}</div>;
  }

  const photoUrl = resolveMediaUrl(profile.profile_photo_url);

  return (
    <div className="space-y-6">
      <BackButton fallback="/courses" />
      <section className="rounded-[2rem] bg-white p-6 shadow-sm dark:bg-surface-dark">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[1.75rem] bg-primary-50 text-primary-700">
              {photoUrl ? (
                <img src={photoUrl} alt={profile.full_name} className="h-full w-full object-cover" />
              ) : (
                <GraduationCap className="h-10 w-10" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-700">Teacher profile</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{profile.full_name}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{profile.bio || "This teacher has not added a bio yet."}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <TeacherStat icon={BookOpen} label="Courses" value={profile.total_courses} />
        <TeacherStat icon={Users} label="Students" value={profile.total_students} />
        <TeacherStat icon={Award} label="Certificates" value={profile.certificates_issued} />
        <TeacherStat icon={GraduationCap} label="Created" value={profile.courses.length} />
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-sm dark:bg-surface-dark">
        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Courses created</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {profile.courses.map((course) => (
            <Link key={course.id} to={`/courses/${course.id}`} className="rounded-2xl border border-slate-200 p-4 transition hover:border-primary-200 dark:border-slate-700">
              <div className="aspect-video overflow-hidden rounded-xl bg-primary-50">
                {course.thumbnail_url ? (
                  <img src={resolveMediaUrl(course.thumbnail_url)} alt={course.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#0f766e,#164e63)] text-white">
                    <BookOpen className="h-8 w-8" />
                  </div>
                )}
              </div>
              <h3 className="mt-4 font-semibold text-slate-950 dark:text-white">{course.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{course.category} / {course.level}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function TeacherStat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number }) {
  return (
    <article className="rounded-[1.5rem] bg-white p-5 shadow-sm dark:bg-surface-dark">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        <div className="rounded-2xl bg-primary-50 p-3 text-primary-700">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 text-2xl font-semibold text-slate-950 dark:text-white">{value}</p>
    </article>
  );
}
