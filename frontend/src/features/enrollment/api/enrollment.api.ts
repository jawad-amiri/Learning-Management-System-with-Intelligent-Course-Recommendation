import { api } from "@/services/api";
import { extractResponseData } from "@/services/response";
import type { Enrollment, EnrollmentRecord, EnrollmentStepId, EnrollmentStatus } from "@/types/course";

export async function enrollInCourseRequest(courseId: number) {
  const response = await api.post("/enrollments", { course_id: courseId });
  return response.data;
}

export async function getMyEnrollmentsRequest() {
  const response = await api.get("/enrollments/my");
  return extractResponseData<Enrollment[]>(response.data);
}

export async function getEnrollmentStatusRequest(courseId: string | number) {
  const response = await api.get(`/enrollments/course/${courseId}/status`);
  return extractResponseData<EnrollmentStatus>(response.data);
}

export async function startEnrollmentRequest(courseId: string | number) {
  const response = await api.post(`/enrollments/course/${courseId}/start`);
  return extractResponseData<EnrollmentRecord>(response.data);
}

export async function completeEnrollmentStepRequest(
  courseId: string | number,
  payload: {
    step: EnrollmentStepId;
    learning_goal?: string;
    interest_topics?: string;
    experience_level?: string;
    learning_motivation?: string;
    preferred_difficulty?: string;
    study_time_per_week?: string;
    accepted_terms?: boolean;
  },
) {
  const response = await api.patch(`/enrollments/course/${courseId}/steps`, payload);
  return extractResponseData<EnrollmentRecord>(response.data);
}
