import { BookOpen } from "lucide-react";

export default function BrandMark() {
  return (
    <div className="flex items-center gap-3 rounded-full bg-white px-3 py-2 shadow-[0_12px_28px_rgba(17,102,94,0.12)] dark:bg-white/7 dark:ring-1 dark:ring-white/10">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#34b6aa] text-white shadow-[0_12px_24px_rgba(52,182,170,0.28)] dark:bg-primary-400 dark:text-slate-950">
        <BookOpen className="h-7 w-7" />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-extrabold uppercase tracking-[0.16em] text-slate-950 dark:text-white">
          BAMIKA
        </p>
        <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-[#34b6aa] dark:text-[#8ee4db]">
          Learning System
        </p>
      </div>
    </div>
  );
}
