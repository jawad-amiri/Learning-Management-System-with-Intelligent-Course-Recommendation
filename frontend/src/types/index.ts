// ============ Core Types ============

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: string;
  created_at?: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  prerequisite_course_id: number | null;
  teacher_id: number;
  status: string;
  created_at: string;
  teacher_name?: string;
}

export interface CourseWithTeacher extends Course {
  teacher_name: string;
}

export interface Section {
  id: number;
  course_id: number;
  title: string;
  position: number;
  created_at: string;
}

export interface Video {
  id: number;
  course_id: number;
  section_id: number;
  title: string;
  description: string | null;
  video_type: 'url' | 'upload';
  video_path: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  duration: number;
  position: number;
  created_at: string;
}

export interface Enrollment {
  id: number;
  user_id: number;
  course_id: number;
  enrolled_at: string;
}

export interface Progress {
  id: number;
  user_id: number;
  course_id: number;
  progress_percent: number;
  manual_percent: number;
  last_updated: string;
}

export interface Comment {
  id: number;
  comment: string;
  user_id: number;
  course_id: number;
  created_at: string;
  updated_at: string;
}

export interface Certificate {
  id: number;
  user_id: number;
  course_id: number;
  certificate_code: string;
  status: string;
  approved_by: number | null;
  issued_at: string;
  integrity_hash: string | null;
}

export interface Rule {
  id: number;
  condition_type: string;
  condition_value: string;
  action: string;
  priority: number;
  created_at: string;
  updated_at?: string;
}

export interface DashboardData {
  users?: User[];
  courses?: Course[];
  total_users?: number;
  total_courses?: number;
  activeCourses?: number;
  course?: CourseWithProgress[];
  total_students?: number;
  total_courses_count?: number;
}

export interface CourseWithProgress {
  id: number;
  title: string;
  status: string;
  teacher_role: string;
  teacher_name: string;
  progress_percent: number;
  is_completed: boolean;
  videos_watched: number;
}

export interface RecommendationRequest {
  user_id: number;
  completed_courses: { category: string; level: string }[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

// ============ API Error ============
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// ============ Auth Types ============
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  full_name: string;
  email: string;
  password: string;
  role: string;
}

export interface VideoWatch {
  id: number;
  user_id: number;
  video_id: number;
  progress_seconds: number;
  completed: boolean;
}
