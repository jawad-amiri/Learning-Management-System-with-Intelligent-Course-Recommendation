import { api } from "@/services/api";
import { extractResponseData } from "@/services/response";
import type { Comment } from "@/types/course";

export async function getCommentsByCourseRequest(courseId: string | number) {
  const response = await api.get(`/comments/${courseId}`);
  return extractResponseData<Comment[]>(response.data);
}

export async function createCommentRequest(courseId: number, comment: string) {
  const response = await api.post("/comments", { course_id: courseId, comment });
  return extractResponseData(response.data);
}

export async function updateCommentRequest(commentId: number, comment: string) {
  const response = await api.put(`/comments/${commentId}`, { comment });
  return extractResponseData(response.data);
}

export async function toggleCommentLikeRequest(commentId: number) {
  const response = await api.put(`/comments/like/${commentId}`);
  return extractResponseData(response.data);
}

export async function showLikesRequest(commentId: number) {
  const response = await api.get(`/comments/showLikes/${commentId}`);
  return extractResponseData(response.data);
}

export async function deleteCommentRequest(commentId: number) {
  const response = await api.delete(`/comments/${commentId}`);
  return extractResponseData(response.data);
}
