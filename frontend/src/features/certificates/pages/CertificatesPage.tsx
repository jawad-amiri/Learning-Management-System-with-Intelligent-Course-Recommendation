import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Download, ShieldCheck } from "lucide-react";
import { getMyEnrollmentsRequest } from "@/features/enrollment/api/enrollment.api";
import { getMyProgressRequest } from "@/features/dashboard/api/dashboard.api";
import {
  approveCertificateRequest,
  downloadCertificateRequest,
  getPendingCertificatesRequest,
  type PendingCertificate,
} from "@/features/certificates/api/certificates.api";
import { useAuth } from "@/features/auth/context/useAuth";
import { getErrorMessage } from "@/services/api";
import EmptyState from "@/components/ui/empty-state";
import type { Enrollment, StudentProgress } from "@/types/course";

export default function CertificatesPage() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<StudentProgress[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [pending, setPending] = useState<PendingCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (user?.role === "teacher") {
        setPending(await getPendingCertificatesRequest());
      } else {
        const [progressData, enrollmentsData] = await Promise.all([
          getMyProgressRequest(),
          getMyEnrollmentsRequest(),
        ]);
        setProgress(progressData);
        setEnrollments(enrollmentsData);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    void load();
  }, [load]);

  const completedCourses = enrollments
    .map((enrollment) => {
      const match = progress.find((item) => item.title === enrollment.title);
      return match?.progress_percent === 100
        ? { id: enrollment.id, title: enrollment.title, progress_percent: match.progress_percent }
        : null;
    })
    .filter((item): item is { id: number; title: string; progress_percent: number } => Boolean(item));

  const handleDownload = async (courseId: number, title: string) => {
    setError("");
    setMessage("");

    try {
      const blob = await downloadCertificateRequest(courseId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `certificate-${title.replace(/\s+/g, "-").toLowerCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setMessage("Certificate download started.");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleApprove = async (certificateId: number) => {
    setBusyId(certificateId);
    setError("");
    setMessage("");

    try {
      const result = await approveCertificateRequest(certificateId);
      setMessage(`Certificate approved. Code: ${result.certificate_code}`);
      setPending(await getPendingCertificatesRequest());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-white p-7 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-primary-700">Certificates</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">
              {user?.role === "teacher"
                ? "Review pending certificate requests."
                : "Access your completed course certificates."}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {user?.role === "teacher"
                ? "Pending certificates come from courses you teach and can be approved by you."
                : "Download approved certificates for completed courses."}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
            <ShieldCheck className="h-4 w-4 text-primary-700" /> Backend certificates
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-[2rem] border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error}</div>
      ) : null}

      {message ? (
        <div className="rounded-[2rem] border border-green-200 bg-green-50 p-5 text-sm text-green-700">{message}</div>
      ) : null}

      {loading ? (
        <div className="rounded-[2rem] bg-white p-8 text-slate-500 shadow-sm">Loading certificates...</div>
      ) : user?.role === "teacher" ? (
        <TeacherCertificates pending={pending} busyId={busyId} onApprove={handleApprove} />
      ) : (
        <StudentCertificates completedCourses={completedCourses} onDownload={handleDownload} />
      )}
    </div>
  );
}

function TeacherCertificates({
  busyId,
  onApprove,
  pending,
}: {
  busyId: number | null;
  onApprove: (certificateId: number) => void;
  pending: PendingCertificate[];
}) {
  if (pending.length === 0) {
    return <EmptyState title="No pending certificates" description="The backend returned no certificates waiting for approval." />;
  }

  return (
    <div className="grid gap-4">
      {pending.map((item) => (
        <article key={item.id} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">{item.course_title}</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">{item.student_name}</h2>
              <p className="mt-1 text-sm text-slate-500">{item.student_email}</p>
            </div>
            <button
              type="button"
              onClick={() => onApprove(item.id)}
              disabled={busyId === item.id}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-600 disabled:opacity-60"
            >
              <CheckCircle2 className="h-4 w-4" />
              {busyId === item.id ? "Approving..." : "Approve"}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

function StudentCertificates({
  completedCourses,
  onDownload,
}: {
  completedCourses: Array<{ id: number; title: string; progress_percent: number }>;
  onDownload: (courseId: number, title: string) => void;
}) {
  if (completedCourses.length === 0) {
    return (
      <EmptyState
        title="No certificates ready"
        description="Complete a course and wait for the backend to create your certificate record."
      />
    );
  }

  return (
    <div className="grid gap-4">
      {completedCourses.map((item) => (
        <article key={item.title} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-slate-500">{item.title}</p>
              <p className="mt-1 text-base text-slate-700">Progress: {item.progress_percent}%</p>
            </div>
            <button
              type="button"
              onClick={() => onDownload(item.id, item.title)}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-600"
            >
              <Download className="h-4 w-4" /> Download certificate
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

