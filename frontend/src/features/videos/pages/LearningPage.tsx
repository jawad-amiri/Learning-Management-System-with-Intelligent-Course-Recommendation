import { useEffect, useMemo, useState } from "react";
import AccessDenied from "@/components/ui/access-denied";
import EmptyState from "@/components/ui/empty-state";
import BackButton from "@/components/ui/back-button";
import VideoPlayer from "@/features/videos/components/VideoPlayer";
import VideoList from "@/features/videos/components/VideoList";
import {
  getVideosByRoleRequest,
  updateVideoProgressRequest,
} from "@/features/videos/api/videos.api";
import { getErrorMessage, isForbiddenError } from "@/services/api";
import { useAuth } from "@/features/auth/context/useAuth";
import type { VideoItem } from "@/types/video";
import { useParams } from "react-router-dom";

export default function LearningPage() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [forbidden, setForbidden] = useState(false);

  const selectedVideo = useMemo(
    () => videos.find((video) => video.id === selectedVideoId) ?? videos[0] ?? null,
    [selectedVideoId, videos],
  );
  const selectedIndex = useMemo(
    () => videos.findIndex((video) => video.id === selectedVideo?.id),
    [selectedVideo?.id, videos],
  );

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!courseId || !user) {
        return;
      }

      setLoading(true);
      setError("");
      setForbidden(false);

      try {
        const nextVideos = await getVideosByRoleRequest(courseId, user.role);
        if (mounted) {
          setVideos(nextVideos);
          setSelectedVideoId((current) => current ?? nextVideos[0]?.id ?? null);
        }
      } catch (error) {
        if (!mounted) {
          return;
        }

        if (isForbiddenError(error)) {
          setForbidden(true);
        } else {
          setError(getErrorMessage(error));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [courseId, user]);

  const handleSelectVideo = async (video: VideoItem) => {
    setSelectedVideoId(video.id);

    if (user?.role !== "student" || video.isWatched) {
      return;
    }

    try {
      const progressTarget = Math.max(1, Math.floor(video.duration * 0.95));
      await updateVideoProgressRequest(video.id, progressTarget);
      setVideos((current) =>
        current.map((item) =>
          item.id === video.id
            ? { ...item, isWatched: true, progress_seconds: progressTarget }
            : item,
        ),
      );
    } catch {
      // Safe fallback: keep UI stable if progress update fails.
    }
  };

  const handleMoveVideo = (direction: "previous" | "next") => {
    const nextIndex = direction === "previous" ? selectedIndex - 1 : selectedIndex + 1;
    const nextVideo = videos[nextIndex];
    if (nextVideo) {
      void handleSelectVideo(nextVideo);
    }
  };

  if (forbidden) {
    return <AccessDenied />;
  }

  return (
    <div className="space-y-6">
      <BackButton fallback="/courses" />
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Learning</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Video playback and watched-state handling based strictly on the backend video routes.
        </p>
      </section>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          {loading ? (
            <div className="rounded-2xl bg-white p-6 text-sm text-slate-500 shadow-sm">
              Loading video player...
            </div>
          ) : videos.length === 0 ? (
            <EmptyState
              title="No videos available"
              description="The backend did not return any videos for this course."
            />
          ) : (
            <VideoPlayer
              video={selectedVideo}
              canGoPrevious={selectedIndex > 0}
              canGoNext={selectedIndex >= 0 && selectedIndex < videos.length - 1}
              onPrevious={() => handleMoveVideo("previous")}
              onNext={() => handleMoveVideo("next")}
            />
          )}
        </div>

        <aside>
          {loading ? (
            <div className="rounded-2xl bg-white p-6 text-sm text-slate-500 shadow-sm">
              Loading video list...
            </div>
          ) : videos.length === 0 ? (
            <EmptyState
              title="No videos available"
              description="Nothing to list for this course."
            />
          ) : (
            <VideoList
              videos={videos}
              selectedId={selectedVideoId}
              onSelect={handleSelectVideo}
            />
          )}
        </aside>
      </section>
    </div>
  );
}
