import { CheckCircle2, CirclePlay, PlayCircle } from "lucide-react";
import type { Video } from "@/types/video";

type VideoListProps = {
  videos: Video[];
  selectedId?: number | null;
  onSelect: (v: Video) => void;
};

function formatDuration(seconds?: number | null) {
  if (!seconds || seconds <= 0) return "Duration unknown";
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60);
  return `${minutes}m ${String(remaining).padStart(2, "0")}s`;
}

const VideoList = ({ videos, selectedId, onSelect }: VideoListProps) => {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-surface-dark">
      <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-700">
        <h3 className="text-base font-semibold text-slate-950 dark:text-white">Course content</h3>
        <p className="mt-1 text-sm text-slate-500">{videos.length} lessons</p>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-700">
        {videos.map((video, index) => {
          const active = selectedId === video.id;

          return (
            <button
              key={video.id}
              type="button"
              onClick={() => onSelect(video)}
              className={[
                "flex w-full items-center gap-3 px-5 py-4 text-left transition",
                active
                  ? "bg-primary-50 text-primary-950 dark:bg-primary-400/12 dark:text-primary-100"
                  : "hover:bg-slate-50 dark:hover:bg-primary-400/10",
              ].join(" ")}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                {active ? <PlayCircle className="h-5 w-5 text-primary-700" /> : <CirclePlay className="h-5 w-5" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">
                  {index + 1}. {video.title}
                </span>
                <span className="mt-1 block text-xs text-slate-500">{formatDuration(video.duration)}</span>
              </span>
              {video.isWatched ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              ) : active ? (
                <span className="shrink-0 rounded-full bg-primary-100 px-2 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-400/15 dark:text-primary-100">Playing</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default VideoList;
