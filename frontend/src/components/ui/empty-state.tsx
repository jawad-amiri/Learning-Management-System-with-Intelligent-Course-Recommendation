export default function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-surface-subtle">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  );
}
