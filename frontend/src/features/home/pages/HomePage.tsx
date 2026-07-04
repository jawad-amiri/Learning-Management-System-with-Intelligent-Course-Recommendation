import { Link } from "react-router-dom";
import type React from "react";
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle2,
  FileText,
  GraduationCap,
  MessageCircle,
  PlayCircle,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import BrandMark from "@/components/brand/BrandMark";
import { useAuth } from "@/features/auth/context/useAuth";

export default function HomePage() {
  const { user } = useAuth();
  const dashboardLink = user ? "/dashboard" : "/register";

  return (
    <div className="min-h-screen bg-[#f4fbf9] text-slate-950">
      {/* Header - soft & clean */}
      <header className="sticky top-0 z-40 border-b border-teal-900/10 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" aria-label="BAMIKA LMS home">
            <BrandMark />
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
            <a href="#features" className="hover:text-primary-700 transition">Features</a>
            <a href="#how-it-works" className="hover:text-primary-700 transition">How it works</a>
            <a href="#roles" className="hover:text-primary-700 transition">For you</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to={user ? "/dashboard" : "/login"} className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition">
              {user ? "Dashboard" : "Login"}
            </Link>
            <Link to={dashboardLink} className="inline-flex items-center gap-2 rounded-full bg-primary-700 px-5 py-2 text-sm font-medium text-white shadow-md shadow-primary-900/15 hover:bg-primary-600 transition">
              Start learning <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section - soft, with a beautiful image */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#e9fbf7] via-white to-[#dff7f1]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-100/30 via-transparent to-transparent" />
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left content */}
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/60 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-primary-700 border border-primary-100">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                  </span>
                  Welcome to BAMIKA
                </div>
                <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                  A calmer way to
                  <span className="block text-primary-700">teach, learn & grow</span>
                </h1>
                <p className="mt-6 text-lg leading-relaxed text-slate-600 max-w-lg">
                  BAMIKA LMS brings courses, lessons, progress tracking, certificates, and smart recommendations into one clean, focused workspace.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link to={dashboardLink} className="inline-flex items-center gap-2 rounded-full bg-primary-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-900/20 hover:bg-primary-600 transition-all hover:scale-105">
                    Get started free <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a href="#features" className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white/50 backdrop-blur-sm px-6 py-3 text-sm font-semibold text-primary-800 hover:bg-primary-50 transition">
                    Explore features
                  </a>
                </div>
                <div className="mt-8 flex gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary-600" />
                    <span>No credit card</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary-600" />
                    <span>Free trial</span>
                  </div>
                </div>
              </div>

              {/* Right side - beautiful hero image */}
              <div className="relative lg:ml-auto">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary-900/10 ring-1 ring-white/50">
                  <img
                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                    alt="Students learning together"
                    className="w-full h-auto object-cover rounded-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
                </div>
                {/* Floating stat card */}
                <div className="absolute -bottom-4 -left-4 bg-white/90 backdrop-blur-md rounded-xl p-3 shadow-lg border border-primary-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary-100 rounded-full p-2">
                      <GraduationCap className="h-5 w-5 text-primary-700" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Trusted by educators</p>
                      <p className="text-xs text-slate-500">2,000+ active learners</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid - all the real system capabilities */}
        <section id="features" className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-primary-700">Core capabilities</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Everything you need in one platform</h2>
              <p className="mt-4 text-slate-500">Built for teachers, students, and administrators</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard title="Structured courses" text="Teachers publish courses with sections, videos, and downloadable resources." icon={BookOpen} />
              <FeatureCard title="Progress tracking" text="Students track watched lessons and see completion progress in real time." icon={BarChart3} />
              <FeatureCard title="Certificates" text="Automated certificate generation and approval workflow for completed courses." icon={Award} />
              <FeatureCard title="Smart recommendations" text="Rule‑based engine suggests relevant courses based on learning history." icon={Brain} />
              <FeatureCard title="Admin oversight" text="Full control over users, courses, roles, and platform activity." icon={ShieldCheck} />
              <FeatureCard title="Community discussions" text="Course‑specific forums for questions and collaboration." icon={MessageCircle} />
            </div>
          </div>
        </section>

        {/* How it works - clean step by step */}
        <section id="how-it-works" className="py-20 bg-[#f4fbf9]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-primary-700">Simple process</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">How it works</h2>
            </div>
            <div className="grid gap-8 md:grid-cols-4">
              <StepCard step="01" title="Create course" description="Teachers build structured courses with lessons and resources." icon={GraduationCap} />
              <StepCard step="02" title="Enroll & learn" description="Students complete enrollment steps and access content." icon={PlayCircle} />
              <StepCard step="03" title="Track progress" description="Monitor watched lessons and overall completion." icon={BarChart3} />
              <StepCard step="04" title="Earn certificate" description="Receive verified certificates upon completion." icon={Award} />
            </div>
          </div>
        </section>

        {/* Role-specific features - teacher & student */}
        <section id="roles" className="py-20 bg-[#0d4f49] text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-primary-200">Dual experience</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Made for teachers & students</h2>
            </div>
            <div className="grid gap-8 lg:grid-cols-2">
              <RolePanel title="For teachers" items={["Create & structure courses", "Upload video lessons", "Share resource files", "Manage enrollment steps"]} icons={[GraduationCap, UploadCloud, FileText, CheckCircle2]} />
              <RolePanel title="For students" items={["Step‑by‑step enrollment", "Watch lessons anywhere", "Join course discussions", "Download certificates"]} icons={[CheckCircle2, PlayCircle, MessageCircle, Award]} />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 bg-white">
          <div className="mx-auto max-w-4xl text-center px-4">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Ready to transform your learning experience?</h2>
            <p className="mt-3 text-slate-500">Join thousands of educators and students using BAMIKA.</p>
            <div className="mt-6">
              <Link to={dashboardLink} className="inline-flex items-center gap-2 rounded-full bg-primary-700 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-primary-600 transition">
                Start free trial <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - soft & minimal */}
      <footer className="border-t border-teal-900/10 bg-[#f4fbf9]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <BrandMark />
          <p>BAMIKA LMS – Courses, progress, certificates, and recommendations in one workspace.</p>
        </div>
      </footer>
    </div>
  );
}

// ----- Reusable Components -----
function FeatureCard({ title, text, icon: Icon }: { title: string; text: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="group rounded-2xl border border-teal-900/10 bg-white p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-0.5">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-700 group-hover:scale-105 transition">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
    </div>
  );
}

function StepCard({ step, title, description, icon: Icon }: { step: string; title: string; description: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-teal-900/10">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-sm font-bold text-primary-800">{step}</span>
        <div className="p-1.5 rounded-full bg-primary-50">
          <Icon className="h-4 w-4 text-primary-700" />
        </div>
      </div>
      <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

function RolePanel({ title, items, icons }: { title: string; items: string[]; icons: React.ComponentType<{ className?: string }>[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm hover:bg-white/10 transition">
      <h3 className="text-xl font-bold">{title}</h3>
      <div className="mt-5 space-y-3">
        {items.map((item, idx) => {
          const Icon = icons[idx % icons.length];
          return (
            <div key={item} className="flex items-center gap-3 rounded-xl bg-white/10 p-3">
              <Icon className="h-4 w-4 text-primary-200" />
              <span className="text-sm font-medium">{item}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
