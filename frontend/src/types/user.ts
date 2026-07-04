export type UserRole = "student" | "teacher" | "admin" | "super_admin";

export type User = {
  id: number;
  full_name: string;
  username?: string | null;
  email: string;
  profile_photo_url?: string | null;
  bio?: string | null;
  expertise?: string | null;
  experience?: string | null;
  profile_completion?: number;
  created_at?: string;
  role: UserRole;
};

export type DashboardCourse = {
  id: number;
  title: string;
  status?: string;
  teacher_name?: string;
  teacher_role?: string;
  teacher_profile_photo_url?: string | null;
  thumbnail_url?: string | null;
  image_url?: string | null;
  enrolled_students?: string;
  avg_progress?: string | number;
  progress_percent?: string | number;
  is_completed?: boolean;
  videos_watched?: string | number;
  created_at?: string;
};

export type DashboardData = {
  users?: Array<{
    id: number;
    full_name: string;
    email: string;
    profile_photo_url?: string | null;
    username?: string | null;
    bio?: string | null;
    expertise?: string | null;
    experience?: string | null;
    role_id?: number;
    role_name?: string;
    created_at?: string;
  }>;
  courses?: DashboardCourse[];
  course?: DashboardCourse[];
  total_users?: number;
  total_courses?: number;
  total_students?: number;
  activeCourses?: number;
  completed_courses?: number;
};

// NEW - PROFILE PHOTO FEATURE: read-only public teacher profile.
export type PublicTeacherProfile = {
  id: number;
  full_name: string;
  username?: string | null;
  profile_photo_url?: string | null;
  bio?: string | null;
  expertise?: string | null;
  experience?: string | null;
  created_at?: string;
  total_courses: string | number;
  total_students: string | number;
  certificates_issued: string | number;
  courses: Array<{
    id: number;
    title: string;
    description: string;
    category: string;
    level: string;
    thumbnail_url?: string | null;
    status?: string;
    created_at?: string;
  }>;
};

