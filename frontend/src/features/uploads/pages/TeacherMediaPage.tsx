import { useEffect, useState } from "react";
import { ChevronDown, Download, FileArchive, FileText, Link2, UploadCloud, Video } from "lucide-react";
import {
  createCourseSectionRequest,
  downloadCourseFileRequest,
  getCourseFilesRequest,
  getCoursesRequest,
  getCourseSectionsRequest,
} from "@/features/courses/api/courses.api";
import { uploadCourseFileRequest, uploadLocalVideoRequest, uploadUrlVideoRequest } from "@/features/uploads/api/uploads.api";
import { getErrorMessage } from "@/services/api";
import { detectVideoDuration } from "@/lib/video";
import type { Course, CourseFile, CourseSection } from "@/types/course";

type UploadMethod = "local" | "link" | "resource";

export default function TeacherMediaPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [sectionId, setSectionId] = useState<number | null>(null);
  const [sectionOptions, setSectionOptions] = useState<CourseSection[]>([]);
  const [files, setFiles] = useState<CourseFile[]>([]);
  const [activeMethod, setActiveMethod] = useState<UploadMethod>("local");
  const [urlForm, setUrlForm] = useState({ title: "", description: "", video_url: "", thumbnail_url: "", duration: "", position: "" });
  const [uploadForm, setUploadForm] = useState({ title: "", description: "", duration: "", position: "", video: null as File | null });
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [fileUpload, setFileUpload] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadCourses = async () => {
      setLoading(true);
      setError("");
      setMessage("");

      try {
        const coursesResult = await getCoursesRequest();
        if (!mounted) return;
        setCourses(coursesResult);
        if (coursesResult.length > 0) {
          setSelectedCourseId(coursesResult[0].id);
        }
      } catch (err) {
        if (!mounted) return;
        setError(getErrorMessage(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadCourses();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadSections = async () => {
      if (!selectedCourseId) {
        setSectionOptions([]);
        setFiles([]);
        return;
      }

      setSectionId(null);
      setFiles([]);
      try {
        const [sections, courseFiles] = await Promise.all([
          getCourseSectionsRequest(selectedCourseId),
          getCourseFilesRequest(selectedCourseId).catch(() => [] as CourseFile[]),
        ]);
        if (!mounted) return;
        setSectionOptions(sections);
        setSectionId(sections[0]?.id ?? null);
        setFiles(courseFiles);
      } catch {
        if (!mounted) return;
        setSectionOptions([]);
        setSectionId(null);
      }
    };

    void loadSections();

    return () => {
      mounted = false;
    };
  }, [selectedCourseId]);

  const refreshFiles = async () => {
    if (!selectedCourseId) return;
    setLoadingFiles(true);
    try {
      setFiles(await getCourseFilesRequest(selectedCourseId));
    } catch {
      setFiles([]);
    } finally {
      setLoadingFiles(false);
    }
  };

  const refreshSections = async () => {
    if (!selectedCourseId) return;

    const sections = await getCourseSectionsRequest(selectedCourseId);
    setSectionOptions(sections);
    setSectionId((current) => current ?? sections[0]?.id ?? null);
  };

  const resetForms = () => {
    setUrlForm({ title: "", description: "", video_url: "", thumbnail_url: "", duration: "", position: "" });
    setUploadForm({ title: "", description: "", duration: "", position: "", video: null });
    setFileUpload(null);
  };

  const handleSubmitUrlVideo = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setUploadProgress(null);
    setError("");
    setMessage("");

    if (!selectedCourseId || sectionId === null) {
      setError("Select a course and section first.");
      setBusy(false);
      return;
    }

    if (!urlForm.title.trim() || !urlForm.video_url.trim()) {
      setError("Enter a title and video URL.");
      setBusy(false);
      return;
    }

    try {
      await uploadUrlVideoRequest(selectedCourseId, sectionId, {
        title: urlForm.title.trim(),
        description: urlForm.description.trim(),
        video_url: urlForm.video_url.trim(),
        thumbnail_url: urlForm.thumbnail_url.trim() || undefined,
        duration: urlForm.duration ? Number(urlForm.duration) : 0,
        position: urlForm.position ? Number(urlForm.position) : undefined,
      });
      setMessage("Video link created successfully.");
      resetForms();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleSubmitUploadVideo = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setUploadProgress(null);
    setError("");
    setMessage("");

    if (!selectedCourseId || sectionId === null || !uploadForm.video) {
      setError("Select a course, select or create a section, and choose a video file first.");
      setBusy(false);
      return;
    }

    const allowedTypes = ["video/mp4", "video/webm", "video/ogg"];
    const allowedExtensions = [".mp4", ".webm", ".ogg"];
    const lowerName = uploadForm.video.name.toLowerCase();
    const hasAllowedExtension = allowedExtensions.some((extension) => lowerName.endsWith(extension));

    if (!allowedTypes.includes(uploadForm.video.type) && !hasAllowedExtension) {
      setError("The backend accepts only MP4, WebM, or OGG videos. Convert this file before uploading.");
      setBusy(false);
      return;
    }

    if (!uploadForm.title.trim()) {
      setError("Enter a lesson title.");
      setBusy(false);
      return;
    }

    try {
      await uploadLocalVideoRequest(selectedCourseId, sectionId, {
        title: uploadForm.title.trim(),
        description: uploadForm.description.trim(),
        duration: uploadForm.duration ? Number(uploadForm.duration) : 0,
        position: uploadForm.position ? Number(uploadForm.position) : undefined,
        video: uploadForm.video,
      }, setUploadProgress);
      setMessage("Uploaded video successfully.");
      resetForms();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleSubmitFileUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setUploadProgress(null);
    setError("");
    setMessage("");

    if (!selectedCourseId || sectionId === null || !fileUpload) {
      setError("Select a course, section and resource file first.");
      setBusy(false);
      return;
    }

    try {
      await uploadCourseFileRequest(selectedCourseId, sectionId, fileUpload, setUploadProgress);
      setMessage("File uploaded successfully.");
      setFileUpload(null);
      await refreshFiles();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleDownloadFile = async (file: CourseFile) => {
    try {
      const blob = await downloadCourseFileRequest(file.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.file_name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleCreateSection = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedCourseId || !newSectionTitle.trim()) {
      setError("Choose a course and enter a section title.");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    try {
      const section = await createCourseSectionRequest(selectedCourseId, {
        title: newSectionTitle.trim(),
      });
      setNewSectionTitle("");
      setMessage("Section created. You can upload into it now.");
      await refreshSections();
      setSectionId(section.id);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-white p-7 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-primary-600">Teacher uploads</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Publish videos and resources for your course.</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Choose one of your courses and a real backend section, then upload local video files, external links, or course files.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
            <UploadCloud className="h-4 w-4 text-primary-600" /> Real backend uploads
          </div>
        </div>
      </section>

      {loading ? (
        <div className="rounded-[2rem] bg-white p-8 text-slate-500 shadow-sm">Loading course list...</div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Course</p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-900">Choose course</h2>
                </div>
                <ChevronDown className="h-5 w-5 text-slate-400" />
              </div>
              <select
                value={selectedCourseId ?? ""}
                onChange={(event) => {
                  setSelectedCourseId(Number(event.target.value));
                  resetForms();
                }}
                className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary-600"
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Section</p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-900">Publish into</h2>
                </div>
                <ChevronDown className="h-5 w-5 text-slate-400" />
              </div>
              <div className="mt-4 space-y-2">
                {sectionOptions.length === 0 ? (
                  <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500">
                    No sections were returned for this course. Create a section before uploading media.
                  </p>
                ) : (
                  sectionOptions.map((section) => (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => setSectionId(section.id)}
                      className={[
                        "w-full rounded-xl border px-4 py-3 text-left text-sm transition",
                        sectionId === section.id
                          ? "border-primary-600 bg-primary-50 text-primary-800"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-primary-300",
                      ].join(" ")}
                    >
                      <span className="block font-semibold">{section.title}</span>
                      <span className="mt-1 block text-xs text-slate-500">Section {section.id}</span>
                    </button>
                  ))
                )}
              </div>
              <form onSubmit={handleCreateSection} className="mt-4 space-y-3">
                <input
                  value={newSectionTitle}
                  onChange={(event) => setNewSectionTitle(event.target.value)}
                  placeholder="New section title"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary-600"
                />
                <button
                  type="submit"
                  disabled={busy || !selectedCourseId || !newSectionTitle.trim()}
                  className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Create section
                </button>
              </form>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <FileArchive className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Resources</p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-900">Uploaded files</h2>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {loadingFiles ? (
                  <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500">Loading files...</p>
                ) : files.length === 0 ? (
                  <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500">
                    No resource files were returned for this course.
                  </p>
                ) : (
                  files.map((file) => (
                    <button
                      key={file.id}
                      type="button"
                      onClick={() => void handleDownloadFile(file)}
                      className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-left text-sm text-slate-700 transition hover:border-primary-300 hover:bg-white"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{file.file_name}</span>
                        <span className="mt-1 block text-xs text-slate-500">
                          Section {file.section_id} / {formatFileSize(file.file_size)}
                        </span>
                      </span>
                      <Download className="h-4 w-4 shrink-0 text-primary-600" />
                    </button>
                  ))
                )}
              </div>
            </section>
          </aside>

          <div className="space-y-6">
            {error ? (
              <div className="rounded-[2rem] border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error}</div>
            ) : null}
            {message ? (
              <div className="rounded-[2rem] border border-green-200 bg-green-50 p-5 text-sm text-green-700">{message}</div>
            ) : null}
            {uploadProgress !== null ? (
              <div className="rounded-[2rem] border border-primary-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                  <span>{busy ? "Uploading..." : "Upload complete"}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-primary-600 transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : null}

            <MethodCard
              active={activeMethod === "link"}
              description="Create an external video lesson for the selected section."
              icon={<Link2 className="h-5 w-5" />}
              title="Upload via link"
              onToggle={() => setActiveMethod("link")}
            >
              <div className="flex items-center gap-3">
                <Video className="h-5 w-5 text-primary-600" />
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Upload a video link</h2>
                  <p className="text-sm text-slate-500">Create a URL-based video for the selected course section.</p>
                </div>
              </div>
              <form onSubmit={handleSubmitUrlVideo} className="mt-6 grid gap-4">
                <input
                  value={urlForm.title}
                  onChange={(event) => setUrlForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Lesson title"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary-500"
                  required
                />
                <textarea
                  value={urlForm.description}
                  onChange={(event) => setUrlForm((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Lesson description"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary-500"
                  rows={3}
                />
                <input
                  value={urlForm.video_url}
                  onChange={(event) => setUrlForm((current) => ({ ...current, video_url: event.target.value }))}
                  placeholder="Video URL"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary-500"
                  required
                />
                <input
                  value={urlForm.thumbnail_url}
                  onChange={(event) => setUrlForm((current) => ({ ...current, thumbnail_url: event.target.value }))}
                  placeholder="Thumbnail URL (optional)"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary-500"
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    type="number"
                    value={urlForm.duration}
                    onChange={(event) => setUrlForm((current) => ({ ...current, duration: event.target.value }))}
                    placeholder="Duration if known (seconds)"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary-500"
                  />
                  <input
                    type="number"
                    value={urlForm.position}
                    onChange={(event) => setUrlForm((current) => ({ ...current, position: event.target.value }))}
                    placeholder="Position (optional)"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={busy || !selectedCourseId || sectionId === null}
                  className="inline-flex items-center justify-center rounded-2xl bg-primary-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Publish link video
                </button>
              </form>
            </MethodCard>

            <MethodCard
              active={activeMethod === "local"}
              description="Upload a local MP4, WebM, or OGG video file."
              icon={<UploadCloud className="h-5 w-5" />}
              title="Upload local video"
              onToggle={() => setActiveMethod("local")}
            >
              <div className="flex items-center gap-3">
                <UploadCloud className="h-5 w-5 text-primary-600" />
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Upload a local video</h2>
                  <p className="text-sm text-slate-500">Upload a course video file to your selected section.</p>
                </div>
              </div>
              <form onSubmit={handleSubmitUploadVideo} className="mt-6 grid gap-4">
                <input
                  value={uploadForm.title}
                  onChange={(event) => setUploadForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Lesson title"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary-500"
                  required
                />
                <textarea
                  value={uploadForm.description}
                  onChange={(event) => setUploadForm((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Lesson description"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary-500"
                  rows={3}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    type="number"
                    value={uploadForm.duration}
                    readOnly
                    placeholder="Duration auto-detected"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-700 outline-none"
                  />
                  <input
                    type="number"
                    value={uploadForm.position}
                    onChange={(event) => setUploadForm((current) => ({ ...current, position: event.target.value }))}
                    placeholder="Position (optional)"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary-500"
                  />
                </div>
                <input
                  type="file"
                  accept=".mp4,.webm,.ogg,video/mp4,video/webm,video/ogg"
                  onChange={async (event) => {
                    const video = event.target.files?.[0] ?? null;
                    const duration = video ? await detectVideoDuration(video) : 0;
                    setUploadForm((current) => ({ ...current, video, duration: duration ? String(duration) : "" }));
                  }}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary-500"
                  required
                />
                <button
                  type="submit"
                  disabled={busy || !selectedCourseId || sectionId === null || !uploadForm.video}
                  className="inline-flex items-center justify-center rounded-2xl bg-primary-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Upload video file
                </button>
              </form>
            </MethodCard>

            <MethodCard
              active={activeMethod === "resource"}
              description="Attach downloadable PDFs, documents, slide decks, or ZIP files."
              icon={<FileText className="h-5 w-5" />}
              title="Upload resource file"
              onToggle={() => setActiveMethod("resource")}
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary-600" />
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Upload course resource</h2>
                  <p className="text-sm text-slate-500">Upload PDF, ZIP, DOC, DOCX or PPT resources for the course section.</p>
                </div>
              </div>
              <form onSubmit={handleSubmitFileUpload} className="mt-6 grid gap-4">
                <input
                  type="file"
                  accept=".pdf,.zip,.doc,.docx,.ppt,.pptx"
                  onChange={(event) => setFileUpload(event.target.files?.[0] ?? null)}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary-500"
                  required
                />
                <button
                  type="submit"
                  disabled={busy || !selectedCourseId || sectionId === null || !fileUpload}
                  className="inline-flex items-center justify-center rounded-2xl bg-primary-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Upload resource file
                </button>
              </form>
            </MethodCard>
          </div>
        </div>
      )}
    </div>
  );
}

function formatFileSize(size: number) {
  if (!Number.isFinite(size) || size <= 0) {
    return "Unknown size";
  }

  if (size < 1024 * 1024) {
    return `${Math.ceil(size / 1024)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function MethodCard({
  active,
  children,
  description,
  icon,
  onToggle,
  title,
}: {
  active: boolean;
  children: React.ReactNode;
  description: string;
  icon: React.ReactNode;
  onToggle: () => void;
  title: string;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-slate-50"
      >
        <span className="flex items-center gap-3">
          <span className={active ? "rounded-xl bg-primary-50 p-3 text-primary-700" : "rounded-xl bg-slate-100 p-3 text-slate-500"}>
            {icon}
          </span>
          <span>
            <span className="block text-base font-semibold text-slate-900">{title}</span>
            <span className="mt-1 block text-sm text-slate-500">{description}</span>
          </span>
        </span>
        <ChevronDown className={active ? "h-5 w-5 rotate-180 text-primary-700 transition" : "h-5 w-5 text-slate-400 transition"} />
      </button>
      {active ? <div className="border-t border-slate-100 p-5">{children}</div> : null}
    </section>
  );
}
