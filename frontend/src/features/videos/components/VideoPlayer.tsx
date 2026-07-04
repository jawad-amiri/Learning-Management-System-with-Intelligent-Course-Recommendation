import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getErrorMessage } from "@/services/api";
import EmptyState from "@/components/ui/empty-state";
import {
  getVideoStreamBlobUrl,
} from "@/features/videos/api/videos.api";
import { youtubeEmbedUrl } from "@/lib/format";
import type { VideoItem } from "@/types/video";

export default function VideoPlayer({
  canGoNext = false,
  canGoPrevious = false,
  onNext,
  onPrevious,
  video,
}: {
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  onNext?: () => void;
  onPrevious?: () => void;
  video: VideoItem | null;
}) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string>("");

  const embedUrl = useMemo(() => youtubeEmbedUrl(video?.video_url), [video?.video_url]);
  useEffect(() => {
    let cancelled = false;
    let currentBlobUrl: string | null = null;

    const loadBlob = async () => {
      setLoadError("");
      setBlobUrl(null);

      if (!video || video.video_type !== "upload") {
        return;
      }

      try {
        const nextUrl = await getVideoStreamBlobUrl(video.id);
        if (!cancelled) {
          currentBlobUrl = nextUrl;
          setBlobUrl(nextUrl);
        } else {
          URL.revokeObjectURL(nextUrl);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(getErrorMessage(error));
        }
      }
    };

    void loadBlob();

    return () => {
      cancelled = true;
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
      }
    };
  }, [video]);

  if (!video) {
    return (
      <EmptyState
        title="No video selected"
        description="Choose a video from the list to start learning."
      />
    );
  }

  const uploadSource = blobUrl;

  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-surface-dark">
      <div className="aspect-video bg-slate-950">
        {video.video_url ? (
          <iframe
            title={video.title}
            src={embedUrl ?? video.video_url ?? ""}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : uploadSource ? (
          <video src={uploadSource} controls controlsList="nodownload" className="h-full w-full bg-black" />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-white/80">
            {loadError || "This uploaded video could not be loaded safely."}
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{video.title}</h2>
            <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">
          {video.description || "No description was provided for this video."}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={onPrevious}
              disabled={!canGoPrevious}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary-200 hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-45 dark:border-slate-700 dark:text-slate-200"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={!canGoNext}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-45"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
