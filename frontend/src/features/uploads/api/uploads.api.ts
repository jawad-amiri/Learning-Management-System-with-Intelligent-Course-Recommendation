import { api } from "@/services/api";
import { extractResponseData } from "@/services/response";
import type { CourseFile } from "@/types/course";
import type { VideoItem } from "@/types/video";

export async function uploadCourseFileRequest(
  courseId: number,
  sectionId: number,
  file: File,
  onProgress?: (progress: number) => void,
) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(`/files/${courseId}/sections/${sectionId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (event) => {
      if (event.total) {
        onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    },
  });

  return extractResponseData<CourseFile>(response.data);
}

export async function uploadUrlVideoRequest(
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

export async function uploadLocalVideoRequest(
  courseId: number,
  sectionId: number,
  payload: {
    title: string;
    description: string;
    duration?: number;
    position?: number;
    video: File;
  },
  onProgress?: (progress: number) => void,
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
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (event) => {
      if (event.total) {
        onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    },
  });

  return extractResponseData<VideoItem>(response.data);
}
