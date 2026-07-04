export type Course = {
  id: number;
  title: string;
  description: string;
  category: string;
  level: string;
  prerequisite_course_id?: number | null;
  thumbnail_url?: string | null;
  image_url?: string | null;
  teacher_id?: number;
  teacher_name?: string;
  teacher_email?: string;
  teacher_profile_photo_url?: string | null;
  teacher_bio?: string | null;
  teacher_expertise?: string | null;
  teacher_experience?: string | null;
  full_name?: string;
  email?: string;
  status?: string;
  created_at?: string;
  recommendation_score?: number;
  recommendation_reasons?: string[];
};

export type Enrollment = {
  id: number;
  title: string;
  category: string;
  level: string;
  thumbnail_url?: string | null;
  image_url?: string | null;
  enrolled_at: string;
};

export type EnrollmentStepId = "requirements" | "learning_goal" | "agreement";

export type EnrollmentStep = {
  id: EnrollmentStepId;
  title: string;
  description: string;
};

export type EnrollmentRecord = {
  id: number;
  status: "pending" | "active";
  current_step: EnrollmentStepId | "completed";
  learning_goal?: string | null;
  interest_topics?: string | null;
  experience_level?: "Beginner" | "Intermediate" | "Advanced" | null;
  learning_motivation?: string | null;
  preferred_difficulty?: "Beginner" | "Intermediate" | "Advanced" | null;
  study_time_per_week?: string | null;
  accepted_terms?: boolean;
  enrolled_at?: string;
  activated_at?: string | null;
};

export type EnrollmentStatus = {
  course: {
    id: number;
    title: string;
    status: string;
    prerequisite_course_id?: number | null;
    prerequisite_title?: string | null;
    prerequisite_progress?: string | number;
  };
  enrollment: EnrollmentRecord | null;
  steps: EnrollmentStep[];
  canStart: boolean;
  prerequisiteMet: boolean;
};

export type CourseSection = {
  id: number;
  course_id: number;
  title: string;
  position: number;
  created_at?: string;
  videos?: Array<{
    id: number;
    title: string;
    description?: string | null;
    video_type?: "url" | "upload";
    video_url?: string | null;
    video_path?: string | null;
    thumbnail_url?: string | null;
    duration: number;
    position: number;
  }>;
};

export type CourseFile = {
  id: number;
  course_id: number;
  section_id: number;
  file_name: string;
  stored_name?: string;
  file_url: string;
  file_size: number;
  mime_type?: string;
  uploaded_by?: number;
  created_at?: string;
};

export type CourseLikeInfo = {
  like_count: string | number;
  is_liked_by_current_user: boolean;
  likes: Array<{
    id: number;
    user_id: number;
    user_name: string;
  }>;
};

export type Comment = {
  id: number;
  comment: string;
  user_id: number;
  course_id: number;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_profile_photo_url?: string | null;
  like_count: string | number;
  is_liked_by_current_user: boolean;
};

export type CourseDashboard = {
  totalVideos: string | number;
  watchedVideos: string | number;
  isCompleted: boolean;
  Progress: number;
};

export type Recommendation = Course;

export type StudentProgress = {
  title: string;
  progress_percent: number;
  last_updated: string;
};

export type CertificateVerification = {
  valid: boolean;
  student?: string;
  course?: string;
  issuedAt?: string;
  message?: string;
};

