import { api } from "@/services/api";
import { extractResponseData } from "@/services/response";
import type { PublicTeacherProfile, User, UserRole } from "@/types/user";

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  full_name: string;
  email: string;
  password: string;
  role: Extract<UserRole, "student" | "teacher">;
};

// NEW - PROFILE PHOTO FEATURE: editable profile fields.
export type UpdateProfilePayload = {
  full_name?: string;
  username?: string;
  email?: string;
  bio?: string;
  expertise?: string;
  experience?: string;
};

// NEW - PROFILE PHOTO FEATURE: password change fields.
export type ChangePasswordPayload = {
  current_password: string;
  new_password: string;
  confirm_password: string;
};

export async function loginRequest(payload: LoginPayload) {
  const response = await api.post("/auth/login", payload);
  return extractResponseData<{
    token: string;
    role: UserRole;
    user: string;
  }>(response.data);
}

export async function meRequest() {
  const response = await api.post("/auth/me");
  return extractResponseData<User>(response.data);
}

export async function registerRequest(payload: RegisterPayload) {
  const response = await api.post("/auth/register", payload);
  return response.data;
}

// NEW - PROFILE PHOTO FEATURE: updates profile and optional profile photo in one request.
export async function updateProfileRequest(payload: UpdateProfilePayload, profilePhoto?: File | null) {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined) {
      formData.append(key, value);
    }
  });

  if (profilePhoto) {
    formData.append("profile_photo", profilePhoto);
  }

  const response = await api.put("/users/me", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return extractResponseData<User>(response.data);
}

// NEW - PROFILE PHOTO FEATURE: removes current user's profile photo.
export async function removeProfilePhotoRequest() {
  const response = await api.delete("/users/me/photo");
  return extractResponseData<User>(response.data);
}

// NEW - PROFILE PHOTO FEATURE: changes current user's password.
export async function changePasswordRequest(payload: ChangePasswordPayload) {
  const response = await api.put("/users/me/password", payload);
  return extractResponseData(response.data);
}

// NEW - PROFILE PHOTO FEATURE: read-only public teacher profile.
export async function getPublicTeacherProfileRequest(teacherId: string | number) {
  const response = await api.get(`/users/teachers/${teacherId}`);
  return extractResponseData<PublicTeacherProfile>(response.data);
}
