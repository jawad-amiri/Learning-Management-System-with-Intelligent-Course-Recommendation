import { api } from "@/services/api";
import { extractResponseData } from "@/services/response";
import type { UserRole } from "@/types/user";
import type { VideoItem } from "@/types/video";

export async function getVideosByRoleRequest(courseId: string | number, role: UserRole) {
  const endpoint =
    role === "student" ? `/videos/course/${courseId}` : `/videos/${courseId}`;
  const response = await api.get(endpoint);
  return extractResponseData<VideoItem[]>(response.data);
}

export async function updateVideoProgressRequest(
  videoId: string | number,
  progressSeconds: number,
) {
  const response = await api.post(`/videos/${videoId}/progress`, {
    progress_seconds: progressSeconds,
  });

  return extractResponseData<{ courseId: number; progressPercent: number }>(response.data);
}

export async function getVideoStreamBlobUrl(videoId: number) {
  const response = await api.get(`/videos/stream/${videoId}`, {
    responseType: "blob",
  });

  return URL.createObjectURL(response.data as Blob);
}

export async function createUrlVideoRequest(
  courseId: number,
  sectionId: number,
  payload: {
    title: string;
    description: string;
    video_url: string;
    thumbnail_url?: string;
    duration?: number;
    position?: number;
  },
) {
  const response = await api.post(`/videos/${courseId}/${sectionId}/url`, payload);
  return extractResponseData<VideoItem>(response.data);
}

export async function uploadVideoRequest(
  courseId: number,
  sectionId: number,
  payload: {
    title: string;
    description: string;
    duration?: number;
    position?: number;
    video: File;
  },
) {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("description", payload.description);
  formData.append("duration", String(payload.duration ?? 0));

  if (payload.position !== undefined) {
    formData.append("position", String(payload.position));
  }

  formData.append("video", payload.video);

  const response = await api.post(`/videos/${courseId}/${sectionId}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return extractResponseData<VideoItem>(response.data);
}

export async function deleteVideoRequest(videoId: number) {
  const response = await api.delete(`/videos/${videoId}`);
  return response.data;
}
