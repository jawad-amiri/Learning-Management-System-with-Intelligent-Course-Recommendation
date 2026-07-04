export default function AccessDenied({
  message = "You do not have permission to view this page.",
}: {
  message?: string;
}) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
      <h2 className="text-lg font-semibold">Access denied</h2>
      <p className="mt-2 text-sm leading-6">{message}</p>
    </div>
  );
}
