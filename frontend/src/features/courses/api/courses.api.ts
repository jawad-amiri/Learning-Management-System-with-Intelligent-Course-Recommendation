import { api } from "@/services/api";
import { extractResponseData } from "@/services/response";
import type { Course, CourseDashboard, CourseFile, CourseLikeInfo, CourseSection } from "@/types/course";

export async function getCoursesRequest() {
  const response = await api.get("/courses");
  return extractResponseData<Course[]>(response.data);
}

export async function getCourseByIdRequest(courseId: string | number) {
  const response = await api.get(`/courses/${courseId}`);
  return extractResponseData<Course>(response.data);
}

export async function getCourseDashboardRequest(courseId: string | number) {
  const response = await api.get(`/courses/${courseId}/dashboard`);
  return extractResponseData<CourseDashboard>(response.data);
}

export async function getCourseSectionsRequest(courseId: string | number) {
  const response = await api.get(`/sections/${courseId}/sections`);
  return extractResponseData<CourseSection[]>(response.data);
}

export async function createCourseSectionRequest(
  courseId: string | number,
  payload: {
    title: string;
    position?: number;
  },
) {
  const response = await api.post(`/sections/${courseId}/sections`, payload);
  return extractResponseData<CourseSection>(response.data);
}

export async function updateCourseSectionRequest(
  sectionId: string | number,
  payload: {
    title?: string;
    position?: number;
  },
) {
  const response = await api.put(`/sections/sections/${sectionId}`, payload);
  return extractResponseData<CourseSection>(response.data);
}

export async function deleteCourseSectionRequest(sectionId: string | number) {
  const response = await api.delete(`/sections/sections/${sectionId}`);
  return response.data;
}

export async function getCourseFilesRequest(courseId: string | number) {
  const response = await api.get(`/files/course/${courseId}`);
  return extractResponseData<CourseFile[]>(response.data);
}

export async function downloadCourseFileRequest(fileId: string | number) {
  const response = await api.get(`/files/download/${fileId}`, {
    responseType: "blob",
  });

  return response.data as Blob;
}

export async function deleteCourseFileRequest(fileId: string | number) {
  const response = await api.delete(`/files/${fileId}`);
  return response.data;
}

export async function getCourseLikeInfoRequest(courseId: string | number) {
  const response = await api.get(`/like/courses/${courseId}`);
  return extractResponseData<CourseLikeInfo>(response.data);
}

export async function toggleCourseLikeRequest(courseId: string | number) {
  const response = await api.put(`/like/courses/${courseId}`);
  return response.data;
}

export async function createCourseRequest(payload: {
  title: string;
  description: string;
  category: string;
  level: string;
  prerequisite_course_id?: number | null;
}, thumbnail?: File | null) {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("description", payload.description);
  formData.append("category", payload.category);
  formData.append("level", payload.level);

  if (payload.prerequisite_course_id) {
    formData.append("prerequisite_course_id", String(payload.prerequisite_course_id));
  }

  if (thumbnail) {
    formData.append("thumbnail", thumbnail);
  }

  const response = await api.post("/courses", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return extractResponseData<Course>(response.data);
}

export async function updateCourseRequest(
  courseId: string | number,
  payload: {
    title: string;
    description: string;
    category: string;
    level: string;
    prerequisite_course_id?: number | null;
  },
  thumbnail?: File | null,
) {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("description", payload.description);
  formData.append("category", payload.category);
  formData.append("level", payload.level);

  if (payload.prerequisite_course_id) {
    formData.append("prerequisite_course_id", String(payload.prerequisite_course_id));
  }

  if (thumbnail) {
    formData.append("thumbnail", thumbnail);
  }

  const response = await api.put(`/courses/${courseId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return extractResponseData<Course>(response.data);
}

export async function replaceCourseThumbnailRequest(courseId: string | number, thumbnail: File) {
  const formData = new FormData();
  formData.append("thumbnail", thumbnail);

  const response = await api.post(`/courses/${courseId}/thumbnail`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return extractResponseData<Course>(response.data);
}

export async function removeCourseThumbnailRequest(courseId: string | number) {
  const response = await api.delete(`/courses/${courseId}/thumbnail`);
  return extractResponseData<Course>(response.data);
}

export async function deleteCourseRequest(courseId: string | number) {
  const response = await api.delete(`/courses/${courseId}`);
  return response.data;
}
