import { useState } from "react";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, ChevronDown, Filter, ListChecks, Sparkles } from "lucide-react";

export default function AdminRulesPage() {
  const [openPanel, setOpenPanel] = useState<"overview" | "rules" | "limits">("overview");

  return (
    <div className="space-y-6">
      <section className="surface-card p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-400/12">
            <BrainCircuit className="h-6 w-6 text-primary-700 dark:text-primary-200" />
          </div>
          <div>
            <Badge variant="primary">Rule-based AI</Badge>
            <h1 className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">Recommendation Engine</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              BAMIKA ranks courses with explainable rules from learner intake, progress, course category, level, and prerequisite readiness. Admin CRUD for rules is not exposed by the backend, so this page documents the real current engine.
            </p>
          </div>
        </div>
      </section>

      <AdminRulePanel
        icon={<Sparkles className="h-5 w-5" />}
        open={openPanel === "overview"}
        title="How recommendations are scored"
        onToggle={() => setOpenPanel(openPanel === "overview" ? "rules" : "overview")}
      >
        <div className="grid gap-4 md:grid-cols-3">
          <RuleItem title="Learner profile" text="Goal, interests, motivation, experience level, preferred difficulty, and weekly study time are collected during enrollment." />
          <RuleItem title="Learning behavior" text="The engine avoids active and completed courses, then rewards next-level courses after strong progress." />
          <RuleItem title="Course fit" text="Courses gain points for matching category, level, interests, and prerequisite readiness." />
        </div>
      </AdminRulePanel>

      <AdminRulePanel
        icon={<ListChecks className="h-5 w-5" />}
        open={openPanel === "rules"}
        title="Active rule groups"
        onToggle={() => setOpenPanel(openPanel === "rules" ? "limits" : "rules")}
      >
        <ul className="grid gap-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          <li>Beginner learners receive a bonus for beginner-friendly courses.</li>
          <li>Preferred difficulty and current experience receive strong match points.</li>
          <li>Interest keywords add points when they appear in course title, description, category, or level.</li>
          <li>Strong progress in a category rewards related next-level courses.</li>
          <li>Courses outside repeated categories get a small discovery bonus.</li>
        </ul>
      </AdminRulePanel>

      <AdminRulePanel
        icon={<Filter className="h-5 w-5" />}
        open={openPanel === "limits"}
        title="Backend limits"
        onToggle={() => setOpenPanel(openPanel === "limits" ? "overview" : "limits")}
      >
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
          Current backend route: <span className="font-mono">GET /api/recommendations</span>. It returns ranked course cards with <span className="font-mono">recommendation_score</span> and <span className="font-mono">recommendation_reasons</span>. There are no admin create/update/delete endpoints for custom rule records yet.
        </p>
      </AdminRulePanel>
    </div>
  );
}

function AdminRulePanel({
  children,
  icon,
  onToggle,
  open,
  title,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  onToggle: () => void;
  open: boolean;
  title: string;
}) {
  return (
    <section className="surface-card overflow-hidden">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left">
        <span className="flex items-center gap-3 text-lg font-semibold text-slate-950 dark:text-white">
          <span className="rounded-2xl bg-primary-50 p-3 text-primary-700 dark:bg-primary-400/12 dark:text-primary-100">{icon}</span>
          {title}
        </span>
        <ChevronDown className={open ? "h-5 w-5 rotate-180 text-slate-400 transition" : "h-5 w-5 text-slate-400 transition"} />
      </button>
      {open ? <div className="border-t border-slate-100 p-6 dark:border-slate-700">{children}</div> : null}
    </section>
  );
}

function RuleItem({ text, title }: { text: string; title: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-surface-subtle">
      <p className="font-semibold text-slate-950 dark:text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{text}</p>
    </div>
  );
}
