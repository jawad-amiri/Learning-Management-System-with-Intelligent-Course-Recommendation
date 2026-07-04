import { useState } from "react";
import { Search } from "lucide-react";
import { verifyCertificateRequest } from "@/features/certificates/api/certificates.api";
import { getErrorMessage } from "@/services/api";
import EmptyState from "@/components/ui/empty-state";

export default function VerifyCertificatePage() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<{
    valid: boolean;
    student?: string;
    course?: string;
    issuedAt?: string;
    message?: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setResult(null);
    setBusy(true);

    try {
      const response = await verifyCertificateRequest(code.trim());
      setResult(response);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-white p-7 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-blue-600">Verify certificate</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Verify a BAMIKA certificate code.</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Enter the code from your certificate to confirm the backend verification status.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
            <Search className="h-4 w-4 text-blue-600" /> Real backend check
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-sm">
        <form onSubmit={handleVerify} className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Enter certificate code"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-slate-900 outline-none focus:border-primary-500"
            required
          />
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-4 text-base font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {busy ? "Verifying..." : "Verify"}
          </button>
        </form>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        ) : null}

        {result ? (
          <div className="mt-4 rounded-[2rem] border border-slate-200 bg-slate-50 p-6 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Status: {result.valid ? "Valid" : "Invalid"}</p>
            <p className="mt-3">{result.message ?? (result.valid ? "Certificate looks good." : "Certificate did not pass verification.")}</p>
            {result.valid ? (
              <div className="mt-5 space-y-2 text-sm text-slate-700">
                <p>
                  <span className="font-semibold">Student:</span> {result.student}
                </p>
                <p>
                  <span className="font-semibold">Course:</span> {result.course}
                </p>
                <p>
                  <span className="font-semibold">Issued:</span> {result.issuedAt}
                </p>
              </div>
            ) : null}
          </div>
        ) : (
          <EmptyState
            title="Enter a certificate code"
            description="The backend will verify it and return the certificate details if approved."
          />
        )}
      </section>
    </div>
  );
}
