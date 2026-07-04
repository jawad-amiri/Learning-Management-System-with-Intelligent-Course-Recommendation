export type VideoItem = {
  id: number;
  course_id?: number;
  section_id?: number;
  title: string;
  description?: string;
  video_type?: "url" | "upload";
  video_url?: string | null;
  video_path?: string | null;
  thumbnail_url?: string | null;
  duration: number;
  position: number;
  progress_seconds?: number;
  isWatched?: boolean;
};

export type Video = VideoItem;
