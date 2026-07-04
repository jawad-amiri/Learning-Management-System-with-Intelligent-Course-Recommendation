import { useEffect, useMemo, useState } from "react";
import type React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, BrainCircuit, Lightbulb, Sparkles, Target } from "lucide-react";
import EmptyState from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { api, getErrorMessage } from "@/services/api";
import { extractResponseData } from "@/services/response";
import { resolveMediaUrl } from "@/lib/media";
import type { Course } from "@/types/course";

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const response = await api.get("/recommendations");
        setRecommendations(extractResponseData<Course[]>(response.data));
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    void loadRecommendations();
  }, []);

  const topCategories = useMemo(
    () => [...new Set(recommendations.map((course) => course.category).filter(Boolean))].slice(0, 3),
    [recommendations],
  );

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-primary-100 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.22),transparent_34%),linear-gradient(135deg,#f8fffc,#eefdf7_48%,#ffffff)] p-6 shadow-sm dark:border-primary-400/20 dark:bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.18),transparent_32%),linear-gradient(135deg,#071a18,#0b1720_60%,#08111a)] md:p-8">
        <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_320px] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary-800 shadow-sm backdrop-blur dark:border-primary-400/25 dark:bg-white/8 dark:text-primary-100">
              <BrainCircuit className="h-4 w-4" />
              Rule-based AI
            </div>
            <h1 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 dark:text-white md:text-4xl">
              Recommended for your learning path
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
              Suggestions are ranked from your enrollment goals, interests, difficulty preference, progress, and completed course history.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-white/70 bg-white/72 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/8">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Learning signal summary</p>
            <div className="mt-4 grid gap-3">
              <Insight icon={<Target className="h-4 w-4" />} label={`${recommendations.length} ranked matches`} />
              <Insight icon={<Sparkles className="h-4 w-4" />} label={topCategories.length ? topCategories.join(", ") : "Build profile data by enrolling"} />
              <Insight icon={<Lightbulb className="h-4 w-4" />} label="Scores explain why each course appears" />
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-200">
          {error}
        </div>
      ) : null}

      {recommendations.length === 0 ? (
        <div className="space-y-4">
          <EmptyState
            title="No recommendations yet"
            description="Enroll in a course and complete the personalization step so BAMIKA can build a useful rule-based learning path."
          />
          <Link to="/courses" className="inline-flex items-center gap-2 rounded-2xl bg-primary-700 px-5 py-3 text-sm font-semibold text-white">
            Browse courses <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <section className="grid gap-5 lg:grid-cols-3">
          {recommendations.map((course, index) => (
            <RecommendationCard key={course.id} course={course} rank={index + 1} />
          ))}
        </section>
      )}

      <section className="rounded-[2rem] bg-white p-6 shadow-sm dark:bg-surface-dark">
        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">How the rule engine scores courses</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <RuleCard title="Learner profile" text="Matches goals, interests, experience level, preferred difficulty, and study time collected during enrollment." />
          <RuleCard title="Learning behavior" text="Avoids active/completed courses and rewards next-level courses after strong progress." />
          <RuleCard title="Course fit" text="Ranks active courses by category continuity, prerequisite readiness, and useful discovery opportunities." />
        </div>
      </section>
    </div>
  );
}

function RecommendationCard({ course, rank }: { course: Course; rank: number }) {
  const image = resolveMediaUrl(course.thumbnail_url || course.image_url);
  const score = Math.round(Number(course.recommendation_score ?? 0));

  return (
    <Link to={`/courses/${course.id}`} className="group">
      <article className="h-full overflow-hidden rounded-[1.75rem] border border-primary-100 bg-white shadow-sm transition hover:-translate-y-1 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-900/8 dark:border-primary-400/15 dark:bg-surface-dark">
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-surface-subtle">
          {image ? (
            <img src={image} alt={course.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_28%_18%,rgba(45,212,191,0.35),transparent_30%),linear-gradient(135deg,#0f766e,#164e63_55%,#0f172a)] text-white">
              <BookOpen className="h-10 w-10" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/72 via-slate-950/10 to-transparent" />
          <div className="absolute left-3 top-3 flex gap-2">
            <Badge variant="primary">#{rank} AI pick</Badge>
            <Badge variant="gray">{score} pts</Badge>
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between gap-3">
            <Badge variant="success">{course.category}</Badge>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{course.level}</span>
          </div>
          <h3 className="mt-4 line-clamp-2 text-lg font-semibold text-slate-950 dark:text-white">{course.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{course.description}</p>
          <div className="mt-4 space-y-2">
            {(course.recommendation_reasons ?? ["Recommended from your learning profile."]).slice(0, 3).map((reason) => (
              <p key={reason} className="flex gap-2 text-xs leading-5 text-slate-600 dark:text-slate-300">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-600 dark:text-primary-300" />
                {reason}
              </p>
            ))}
          </div>
        </div>
      </article>
    </Link>
  );
}

function Insight({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-3 text-sm text-slate-700 dark:bg-white/8 dark:text-slate-200">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-50 text-primary-700 dark:bg-primary-400/12 dark:text-primary-100">{icon}</span>
      {label}
    </div>
  );
}

function RuleCard({ text, title }: { text: string; title: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 dark:border-slate-700 dark:bg-surface-subtle">
      <p className="font-semibold text-slate-950 dark:text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{text}</p>
    </div>
  );
}
