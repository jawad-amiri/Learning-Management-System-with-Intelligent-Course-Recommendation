import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

// NEW FEATURE: consistent safe back navigation for detail/settings pages.
export default function BackButton({ fallback = "/dashboard" }: { fallback?: string }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) navigate(-1);
        else navigate(fallback);
      }}
      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary-200 hover:text-primary-700 dark:border-slate-700 dark:bg-surface-dark dark:text-slate-200"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </button>
  );
}
