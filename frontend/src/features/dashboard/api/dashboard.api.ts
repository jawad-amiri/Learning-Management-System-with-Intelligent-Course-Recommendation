import { api } from "@/services/api";
import { extractResponseData } from "@/services/response";
import type { Recommendation, StudentProgress } from "@/types/course";
import type { DashboardData } from "@/types/user";

export async function getDashboardRequest() {
  const response = await api.get("/dashboard");
  return extractResponseData<DashboardData>(response.data);
}

export async function getMyProgressRequest() {
  const response = await api.get("/progress/my");
  return extractResponseData<StudentProgress[]>(response.data);
}

export async function getRecommendationsRequest() {
  const response = await api.get("/recommendations");
  return extractResponseData<Recommendation[]>(response.data);
}
