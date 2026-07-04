import { useCallback, useEffect, useMemo, useState } from "react";
import type React from "react";
import { ChevronDown, FileText, ImagePlus, Plus, Save, Trash2, UploadCloud, Video } from "lucide-react";
import { useParams } from "react-router-dom";
import BackButton from "@/components/ui/back-button";
import EmptyState from "@/components/ui/empty-state";
import {
  createCourseSectionRequest,
  deleteCourseFileRequest,
  deleteCourseSectionRequest,
  getCourseByIdRequest,
  getCourseFilesRequest,
  getCourseSectionsRequest,
  updateCourseRequest,
} from "@/features/courses/api/courses.api";
import { deleteVideoRequest } from "@/features/videos/api/videos.api";
import { uploadCourseFileRequest, uploadLocalVideoRequest, uploadUrlVideoRequest } from "@/features/uploads/api/uploads.api";
import { getErrorMessage } from "@/services/api";
import { resolveMediaUrl } from "@/lib/media";
import { detectVideoDuration } from "@/lib/video";
import type { Course, CourseFile, CourseSection } from "@/types/course";

type PanelId = "info" | "sections" | "videos" | "files";

export default function CourseEditPage() {
  const { id } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [files, setFiles] = useState<CourseFile[]>([]);
const [openPanel, setOpenPanel] = useState<PanelId>("info");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [form, setForm] = useState({ title: "", description: "", category: "", level: "Beginner" });
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [urlVideo, setUrlVideo] = useState({ title: "", description: "", video_url: "", thumbnail_url: "" });
  const [localVideo, setLocalVideo] = useState({ title: "", description: "", video: null as File | null, duration: 0 });
  const [resourceFile, setResourceFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const thumbnailPreview = useMemo(() => {
    if (thumbnail) return URL.createObjectURL(thumbnail);
    return resolveMediaUrl(course?.thumbnail_url || course?.image_url);
  }, [course?.image_url, course?.thumbnail_url, thumbnail]);

  const load = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError("");

    try {
      const [courseData, sectionData, fileData] = await Promise.all([
        getCourseByIdRequest(id),
        getCourseSectionsRequest(id),
        getCourseFilesRequest(id).catch(() => [] as CourseFile[]),
      ]);
      setCourse(courseData);
      setSections(sectionData);
      setFiles(fileData);
      setSelectedSectionId(sectionData[0]?.id ?? null);
      setForm({
        title: courseData.title,
        description: courseData.description,
        category: courseData.category,
        level: courseData.level,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    return () => {
      if (thumbnailPreview?.startsWith("blob:")) URL.revokeObjectURL(thumbnailPreview);
    };
  }, [thumbnailPreview]);

  const saveCourseInfo = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id) return;

    setBusy(true);
    setError("");
    setMessage("");

    try {
      const updated = await updateCourseRequest(id, {
        title: form.title,
        description: form.description,
        category: form.category,
        level: form.level,
      }, thumbnail);
      setCourse(updated);
      setThumbnail(null);
      setMessage("Course information saved.");
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const addSection = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id || !newSectionTitle.trim()) return;

    setBusy(true);
    try {
      const section = await createCourseSectionRequest(id, { title: newSectionTitle.trim() });
      setNewSectionTitle("");
      setSelectedSectionId(section.id);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const uploadUrlVideo = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id || !selectedSectionId) return;

    setBusy(true);
    try {
      await uploadUrlVideoRequest(Number(id), selectedSectionId, {
        title: urlVideo.title,
        description: urlVideo.description,
        video_url: urlVideo.video_url,
        thumbnail_url: urlVideo.thumbnail_url || undefined,
        duration: 0,
      });
      setUrlVideo({ title: "", description: "", video_url: "", thumbnail_url: "" });
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const uploadLocalVideo = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id || !selectedSectionId || !localVideo.video) return;

    setBusy(true);
    try {
      await uploadLocalVideoRequest(Number(id), selectedSectionId, {
        title: localVideo.title,
        description: localVideo.description,
        duration: localVideo.duration,
        video: localVideo.video,
      });
      setLocalVideo({ title: "", description: "", video: null, duration: 0 });
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const uploadFile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id || !selectedSectionId || !resourceFile) return;

    setBusy(true);
    try {
      await uploadCourseFileRequest(Number(id), selectedSectionId, resourceFile);
      setResourceFile(null);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div className="rounded-[2rem] bg-white p-8 text-slate-500 shadow-sm dark:bg-surface-dark">Loading course editor...</div>;
  }

  if (!course) {
    return <EmptyState title="Course not found" description={error || "The course editor could not load this course."} />;
  }

  return (
    <div className="space-y-6">
      <BackButton fallback={`/courses/${id}`} />

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}
      {message ? <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">{message}</div> : null}

      <section className="rounded-[2rem] bg-white p-6 shadow-sm dark:bg-surface-dark">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary-700">Manage course</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{course.title}</h1>
      </section>

      <EditorPanel id="info" open={openPanel === "info"} title="Course Information" icon={<ImagePlus className="h-5 w-5" />} onToggle={() => setOpenPanel(openPanel === "info" ? "sections" : "info")}>
        <form onSubmit={saveCourseInfo} className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div>
            <div className="aspect-video overflow-hidden rounded-2xl bg-slate-100">
              {thumbnailPreview ? <img src={thumbnailPreview} alt={course.title} className="h-full w-full object-cover" /> : null}
            </div>
            <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary-700 px-4 py-2 text-sm font-semibold text-white">
              <UploadCloud className="h-4 w-4" />
              Change thumbnail
              <input type="file" accept="image/*" className="sr-only" onChange={(event) => setThumbnail(event.target.files?.[0] ?? null)} />
            </label>
          </div>
          <div className="grid gap-4">
            <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="input-field" placeholder="Course title" required />
            <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="input-field min-h-32" placeholder="Description" required />
            <div className="grid gap-4 sm:grid-cols-2">
              <input value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} className="input-field" placeholder="Category" required />
              <select value={form.level} onChange={(event) => setForm((current) => ({ ...current, level: event.target.value }))} className="input-field">
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
            <button disabled={busy} className="inline-flex w-fit items-center gap-2 rounded-2xl bg-primary-700 px-5 py-3 text-sm font-semibold text-white">
              <Save className="h-4 w-4" />
              Save course
            </button>
          </div>
        </form>
      </EditorPanel>

      <EditorPanel id="sections" open={openPanel === "sections"} title="Sections" icon={<Plus className="h-5 w-5" />} onToggle={() => setOpenPanel(openPanel === "sections" ? "videos" : "sections")}>
        <form onSubmit={addSection} className="flex flex-col gap-3 sm:flex-row">
          <input value={newSectionTitle} onChange={(event) => setNewSectionTitle(event.target.value)} className="input-field" placeholder="Section name" />
          <button disabled={busy || !newSectionTitle.trim()} className="rounded-2xl bg-primary-700 px-5 py-3 text-sm font-semibold text-white">Add section</button>
        </form>
        <div className="mt-5 grid gap-3">
          {sections.map((section) => (
            <div key={section.id} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
              <button type="button" onClick={() => setSelectedSectionId(section.id)} className={selectedSectionId === section.id ? "font-semibold text-primary-700" : "font-semibold text-slate-800 dark:text-slate-100"}>{section.title}</button>
              <button type="button" onClick={async () => { await deleteCourseSectionRequest(section.id); await load(); }} className="rounded-xl p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      </EditorPanel>

      <EditorPanel id="videos" open={openPanel === "videos"} title="Videos" icon={<Video className="h-5 w-5" />} onToggle={() => setOpenPanel(openPanel === "videos" ? "files" : "videos")}>
        <div className="mt-5 grid gap-5 lg:grid-cols-2"/>
        <div className="mt-5 grid items-start gap-5 lg:grid-cols-2">
          <form onSubmit={uploadLocalVideo} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
            <h3 className="font-semibold text-slate-950 dark:text-white">Upload local video</h3>
            <div className="mt-4 grid gap-3">
              <input value={localVideo.title} onChange={(event) => setLocalVideo((current) => ({ ...current, title: event.target.value }))} className="input-field" placeholder="Video title" required />
              <input value={localVideo.description} onChange={(event) => setLocalVideo((current) => ({ ...current, description: event.target.value }))} className="input-field" placeholder="Description" />
              <input type="file" accept="video/mp4,video/webm,video/ogg" onChange={async (event) => {
                const video = event.target.files?.[0] ?? null;
                const duration = video ? await detectVideoDuration(video) : 0;
                setLocalVideo((current) => ({ ...current, video, duration }));
              }} className="input-field" />
              <p className="text-xs text-slate-500">Detected duration: {localVideo.duration ? `${localVideo.duration}s` : "unknown"}</p>
              <button disabled={busy || !localVideo.video} className="rounded-2xl bg-primary-700 px-5 py-3 text-sm font-semibold text-white">Upload video</button>
            </div>
          </form>
          <form onSubmit={uploadUrlVideo} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
            <h3 className="font-semibold text-slate-950 dark:text-white">Add video URL</h3>
            <div className="mt-4 grid gap-3">
              <input value={urlVideo.title} onChange={(event) => setUrlVideo((current) => ({ ...current, title: event.target.value }))} className="input-field" placeholder="Video title" required />
              <input value={urlVideo.video_url} onChange={(event) => setUrlVideo((current) => ({ ...current, video_url: event.target.value }))} className="input-field" placeholder="Video URL" required />
              <input value={urlVideo.description} onChange={(event) => setUrlVideo((current) => ({ ...current, description: event.target.value }))} className="input-field" placeholder="Description" />
              <button disabled={busy || !urlVideo.video_url} className="rounded-2xl bg-primary-700 px-5 py-3 text-sm font-semibold text-white">Add URL video</button>
            </div>
          </form>
        </div>
        <div className="mt-5 divide-y divide-slate-100 rounded-2xl border border-slate-200 dark:divide-slate-700 dark:border-slate-700">
          {sections.flatMap((section) => section.videos?.map((video) => ({ ...video, sectionTitle: section.title })) ?? []).map((video) => (
            <div key={video.id} className="flex items-center justify-between gap-3 p-4">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{video.title}</p>
                <p className="text-xs text-slate-500">{video.sectionTitle}</p>
              </div>
              <button type="button" onClick={async () => { await deleteVideoRequest(video.id); await load(); }} className="rounded-xl p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      </EditorPanel>

      <EditorPanel id="files" open={openPanel === "files"} title="Files and Resources" icon={<FileText className="h-5 w-5" />} onToggle={() => setOpenPanel(openPanel === "files" ? "info" : "files")}>
        <SectionPicker sections={sections} value={selectedSectionId} onChange={setSelectedSectionId} />
        <form onSubmit={uploadFile} className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input type="file" onChange={(event) => setResourceFile(event.target.files?.[0] ?? null)} className="input-field" />
          <button disabled={busy || !resourceFile} className="rounded-2xl bg-primary-700 px-5 py-3 text-sm font-semibold text-white">Upload file</button>
        </form>
        <div className="mt-5 grid gap-3">
          {files.map((file) => (
            <div key={file.id} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
              <span className="font-semibold text-slate-900 dark:text-white">{file.file_name}</span>
              <button type="button" onClick={async () => { await deleteCourseFileRequest(file.id); await load(); }} className="rounded-xl p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      </EditorPanel>
    </div>
  );
}

function EditorPanel({ children, icon, id, onToggle, open, title }: { children: React.ReactNode; icon: React.ReactNode; id: string; onToggle: () => void; open: boolean; title: string }) {
  return (
    <section className="overflow-hidden rounded-[2rem] bg-white shadow-sm dark:bg-surface-dark" id={id}>
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left">
        <span className="flex items-center gap-3 text-lg font-semibold text-slate-950 dark:text-white">
          <span className="rounded-2xl bg-primary-50 p-3 text-primary-700 dark:bg-primary-400/12 dark:text-primary-100">{icon}</span>
          {title}
        </span>
        <ChevronDown className={open ? "h-5 w-5 rotate-180 text-slate-400 transition" : "h-5 w-5 text-slate-400 transition"} />
      </button>
      {open ? <div className="border-t border-slate-100 p-6 dark:border-slate-700">{children}</div> : null}
    </section>
  );
}

function SectionPicker({ sections, value, onChange }: { sections: CourseSection[]; value: number | null; onChange: (value: number) => void }) {
  return (
    <select value={value ?? ""} onChange={(event) => onChange(Number(event.target.value))} className="input-field max-w-md">
      {sections.map((section) => <option key={section.id} value={section.id}>{section.title}</option>)}
    </select>
  );
}
