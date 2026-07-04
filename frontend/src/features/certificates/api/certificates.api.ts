import { api } from "@/services/api";
import { extractResponseData } from "@/services/response";
import type { CertificateVerification } from "@/types/course";

export type PendingCertificate = {
  id: number;
  user_id: number;
  course_id: number;
  status: string;
  issued_at: string;
  student_name: string;
  student_email: string;
  course_title: string;
};

export async function downloadCertificateRequest(courseId: number) {
  const response = await api.get(`/certificates/course/${courseId}/download`, {
    responseType: "blob",
  });

  return response.data as Blob;
}

export async function verifyCertificateRequest(code: string) {
  const response = await api.get(`/certificates/verify/${code}`);
  return extractResponseData<CertificateVerification>(response.data);
}

export async function getPendingCertificatesRequest() {
  const response = await api.get("/certificates/pending");
  return extractResponseData<PendingCertificate[]>(response.data);
}

export async function approveCertificateRequest(certificateId: number) {
  const response = await api.post(`/certificates/${certificateId}/approve`);
  return extractResponseData<{ certificate_code: string }>(response.data);
}
