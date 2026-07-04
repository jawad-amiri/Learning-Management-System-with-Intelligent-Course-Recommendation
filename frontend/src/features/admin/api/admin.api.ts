import { api } from "@/services/api";
import { extractResponseData } from "@/services/response";

export type AdminUserRecord = {
  id: number;
  full_name: string;
  email: string;
  role_id?: number;
  created_at?: string;
};

export async function getAdminUsersRequest() {
  const response = await api.get("/admin/users");
  return extractResponseData<AdminUserRecord[]>(response.data);
}

export async function deleteAdminUserRequest(userId: number) {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
}

export async function upgradeUserToAdminRequest(userId: number) {
  const response = await api.post(`/admin/users/upgrade/${userId}`);
  return response.data;
}

export async function downgradeAdminRequest(
  userId: number,
  downgradedTo: "student" | "teacher",
) {
  const response = await api.post(`/admin/users/downgrade/${userId}`, {
    downgradedTo,
  });
  return response.data;
}

export async function deleteSuperAdminTargetRequest(userId: number) {
  const response = await api.delete(`/admin/super/users/${userId}`);
  return response.data;
}
