import { useEffect, useMemo, useState } from "react";
import { BookOpen, CheckCircle2, ClipboardList, Heart, MessageCircle, PlayCircle, ShieldCheck, Target, Trash2, X } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import AccessDenied from "@/components/ui/access-denied";
import BackButton from "@/components/ui/back-button";
import EmptyState from "@/components/ui/empty-state";
import {
  getCourseByIdRequest,
  getCourseDashboardRequest,
  getCourseLikeInfoRequest,
  getCourseFilesRequest,
  getCourseSectionsRequest,
  downloadCourseFileRequest,
  toggleCourseLikeRequest,
} from "@/features/courses/api/courses.api";
import {
  createCommentRequest,
  deleteCommentRequest,
  getCommentsByCourseRequest,
  toggleCommentLikeRequest,
} from "@/features/comments/api/comments.api";
import {
  completeEnrollmentStepRequest,
  getEnrollmentStatusRequest,
  startEnrollmentRequest,
} from "@/features/enrollment/api/enrollment.api";
import {
  getVideosByRoleRequest,
  updateVideoProgressRequest,
} from "@/features/videos/api/videos.api";
import VideoPlayer from "@/features/videos/components/VideoPlayer";
import VideoList from "@/features/videos/components/VideoList";
import { getErrorMessage, isForbiddenError } from "@/services/api";
import type {
  Comment,
  Course,
  CourseDashboard,
  CourseFile,
  CourseSection,
  CourseLikeInfo,
  EnrollmentStatus,
  EnrollmentStepId,
} from "@/types/course";
import type { VideoItem } from "@/types/video";
import { useAuth } from "@/features/auth/context/useAuth";
import { toNumber } from "@/lib/format";
import { resolveMediaUrl } from "@/lib/media";

export default function CourseDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [files, setFiles] = useState<CourseFile[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);
  const [likes, setLikes] = useState<CourseLikeInfo | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [dashboard, setDashboard] = useState<CourseDashboard | null>(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState<EnrollmentStatus | null>(null);
  const [enrollmentOpen, setEnrollmentOpen] = useState(false);
  const [learningGoal, setLearningGoal] = useState("");
  const [interestTopics, setInterestTopics] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Beginner");
  const [learningMotivation, setLearningMotivation] = useState("");
  const [preferredDifficulty, setPreferredDifficulty] = useState("Beginner");
  const [studyTimePerWeek, setStudyTimePerWeek] = useState("4-6 hours");
  const [acceptedAgreement, setAcceptedAgreement] = useState(false);
  const [enrollmentBusy, setEnrollmentBusy] = useState(false);
  const [comment, setComment] = useState("");
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [forbidden, setForbidden] = useState(false);
  const [message, setMessage] = useState("");
  const [videoAccessMessage, setVideoAccessMessage] = useState("");

  const selectedVideo = useMemo(
    () => videos.find((video) => video.id === selectedVideoId) ?? videos[0] ?? null,
    [selectedVideoId, videos],
  );
  const selectedVideoIndex = useMemo(
    () => videos.findIndex((video) => video.id === selectedVideo?.id),
    [selectedVideo?.id, videos],
  );

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!id || !user) {
        return;
      }

      setLoadingCourse(true);
      setLoadingVideos(true);
      setLoadingComments(true);
      setError("");
      setForbidden(false);
      setVideoAccessMessage("");

      try {
        const courseResult = await getCourseByIdRequest(id);
        if (mounted) {
          setCourse(courseResult);
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
        setLoadingCourse(false);
        setLoadingVideos(false);
        setLoadingComments(false);
        return;
      } finally {
        if (mounted) {
          setLoadingCourse(false);
        }
      }

      const [
        videosResult,
        sectionsResult,
        filesResult,
        likesResult,
        commentsResult,
        dashboardResult,
        enrollmentStatusResult,
      ] =
        await Promise.allSettled([
          getVideosByRoleRequest(id, user.role),
          getCourseSectionsRequest(id),
          getCourseFilesRequest(id),
          getCourseLikeInfoRequest(id),
          getCommentsByCourseRequest(id),
          user.role === "student" ? getCourseDashboardRequest(id) : Promise.resolve(null),
          user.role === "student" ? getEnrollmentStatusRequest(id) : Promise.resolve(null),
        ]);

      if (!mounted) {
        return;
      }

      if (videosResult.status === "fulfilled") {
        setVideos(videosResult.value);
        setSelectedVideoId((current) => current ?? videosResult.value[0]?.id ?? null);
      } else {
        setVideos([]);
        setSelectedVideoId(null);
        setVideoAccessMessage(
          user.role === "student"
            ? "Videos become available after enrollment."
            : "Video access is limited for this course and role.",
        );
      }

      if (sectionsResult.status === "fulfilled") {
        setSections(sectionsResult.value);
      } else {
        setSections([]);
      }

      if (filesResult.status === "fulfilled") {
        setFiles(filesResult.value);
      } else {
        setFiles([]);
      }

      if (likesResult.status === "fulfilled") {
        setLikes(likesResult.value);
      }

      if (commentsResult.status === "fulfilled") {
        setComments(commentsResult.value);
      } else {
        setComments([]);
      }
      setLoadingComments(false);

      if (dashboardResult.status === "fulfilled") {
        setDashboard(dashboardResult.value);
      } else {
        setDashboard(null);
      }

      if (enrollmentStatusResult.status === "fulfilled") {
        setEnrollmentStatus(enrollmentStatusResult.value);
        setLearningGoal(enrollmentStatusResult.value?.enrollment?.learning_goal ?? "");
      } else {
        setEnrollmentStatus(null);
      }

      setLoadingVideos(false);
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [id, user]);

  const markSelectedAsWatched = async (video: VideoItem) => {
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
      // Safe fallback: do not crash if marking progress fails.
    }
  };

  const handleSelectVideo = async (video: VideoItem) => {
    setSelectedVideoId(video.id);
    await markSelectedAsWatched(video);
  };

  const handleMoveVideo = (direction: "previous" | "next") => {
    const nextIndex = direction === "previous" ? selectedVideoIndex - 1 : selectedVideoIndex + 1;
    const nextVideo = videos[nextIndex];
    if (nextVideo) {
      void handleSelectVideo(nextVideo);
    }
  };

  const handleEnroll = async () => {
    if (!id) {
      return;
    }

    setMessage("");
    setError("");
    setEnrollmentBusy(true);

    try {
      const enrollment = await startEnrollmentRequest(id);
      const status = await getEnrollmentStatusRequest(id);
      setEnrollmentStatus({ ...status, enrollment });
      setLearningGoal(enrollment.learning_goal ?? "");
      setInterestTopics(enrollment.interest_topics ?? "");
      setExperienceLevel(enrollment.experience_level ?? "Beginner");
      setLearningMotivation(enrollment.learning_motivation ?? "");
      setPreferredDifficulty(enrollment.preferred_difficulty ?? "Beginner");
      setStudyTimePerWeek(enrollment.study_time_per_week ?? "4-6 hours");
      setEnrollmentOpen(enrollment.status !== "active");
      if (enrollment.status === "active") {
        setMessage("You are already enrolled in this course.");
      }
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setEnrollmentBusy(false);
    }
  };

  const refreshStudentAccess = async () => {
    if (!id || user?.role !== "student") return;

    const [statusResult, videosResult, dashboardResult] = await Promise.allSettled([
      getEnrollmentStatusRequest(id),
      getVideosByRoleRequest(id, "student"),
      getCourseDashboardRequest(id),
    ]);

    if (statusResult.status === "fulfilled") {
      setEnrollmentStatus(statusResult.value);
      setLearningGoal(statusResult.value.enrollment?.learning_goal ?? "");
      setInterestTopics(statusResult.value.enrollment?.interest_topics ?? "");
      setExperienceLevel(statusResult.value.enrollment?.experience_level ?? "Beginner");
      setLearningMotivation(statusResult.value.enrollment?.learning_motivation ?? "");
      setPreferredDifficulty(statusResult.value.enrollment?.preferred_difficulty ?? "Beginner");
      setStudyTimePerWeek(statusResult.value.enrollment?.study_time_per_week ?? "4-6 hours");
    }

    if (videosResult.status === "fulfilled") {
      setVideos(videosResult.value);
      setSelectedVideoId(videosResult.value[0]?.id ?? null);
      setVideoAccessMessage("");
    }

    if (dashboardResult.status === "fulfilled") {
      setDashboard(dashboardResult.value);
    }
  };

  const handleCompleteEnrollmentStep = async (step: EnrollmentStepId) => {
    if (!id) {
      return;
    }

    setEnrollmentBusy(true);
    setError("");
    setMessage("");

    try {
      await completeEnrollmentStepRequest(id, {
        step,
        learning_goal: step === "learning_goal" ? learningGoal : undefined,
        interest_topics: step === "learning_goal" ? interestTopics : undefined,
        experience_level: step === "learning_goal" ? experienceLevel : undefined,
        learning_motivation: step === "learning_goal" ? learningMotivation : undefined,
        preferred_difficulty: step === "learning_goal" ? preferredDifficulty : undefined,
        study_time_per_week: step === "learning_goal" ? studyTimePerWeek : undefined,
        accepted_terms: step === "agreement" ? acceptedAgreement : undefined,
      });

      await refreshStudentAccess();

      if (step === "agreement") {
        setEnrollmentOpen(false);
        setMessage("Enrollment completed. Your course materials are unlocked.");
      }
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setEnrollmentBusy(false);
    }
  };

  const handleToggleLike = async () => {
    if (!id) {
      return;
    }

    try {
      await toggleCourseLikeRequest(id);
      const nextLikes = await getCourseLikeInfoRequest(id);
      setLikes(nextLikes);
    } catch (error) {
      setError(getErrorMessage(error));
    }
  };

  const handleCreateComment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id || !comment.trim()) {
      return;
    }

    setSubmittingComment(true);
    setError("");

    try {
      await createCommentRequest(Number(id), comment.trim());
      setComment("");
      setComments(await getCommentsByCourseRequest(id));
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleToggleCommentLike = async (commentId: number) => {
    if (!id) {
      return;
    }

    try {
      await toggleCommentLikeRequest(commentId);
      setComments(await getCommentsByCourseRequest(id));
    } catch (error) {
      setError(getErrorMessage(error));
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!id) {
      return;
    }

    setDeletingCommentId(commentId);
    setError("");

    try {
      await deleteCommentRequest(commentId);
      setComments(await getCommentsByCourseRequest(id));
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setDeletingCommentId(null);
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
    } catch (error) {
      setError(getErrorMessage(error));
    }
  };

  if (forbidden) {
    return <AccessDenied />;
  }

  const formatTimestamp = (value: string) =>
    new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));

  const isEnrolled = enrollmentStatus?.enrollment?.status === "active";
  const currentEnrollmentStep = enrollmentStatus?.enrollment?.current_step ?? "requirements";
  const courseThumbnail = resolveMediaUrl(course?.thumbnail_url || course?.image_url);

  return (
    <div className="space-y-6">
      <BackButton fallback="/courses" />
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-600">
          {message}
        </div>
      ) : null}

      {user?.role === "student" && enrollmentOpen && enrollmentStatus ? (
        <EnrollmentWizard
          status={enrollmentStatus}
          currentStep={currentEnrollmentStep}
          learningGoal={learningGoal}
          interestTopics={interestTopics}
          experienceLevel={experienceLevel}
          learningMotivation={learningMotivation}
          preferredDifficulty={preferredDifficulty}
          studyTimePerWeek={studyTimePerWeek}
          acceptedAgreement={acceptedAgreement}
          busy={enrollmentBusy}
          onGoalChange={setLearningGoal}
          onInterestTopicsChange={setInterestTopics}
          onExperienceLevelChange={setExperienceLevel}
          onLearningMotivationChange={setLearningMotivation}
          onPreferredDifficultyChange={setPreferredDifficulty}
          onStudyTimePerWeekChange={setStudyTimePerWeek}
          onAgreementChange={setAcceptedAgreement}
          onClose={() => setEnrollmentOpen(false)}
          onCompleteStep={handleCompleteEnrollmentStep}
        />
      ) : null}

      <section className="rounded-[2rem] bg-white p-5 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-stretch">
          <div className="p-2 lg:p-3">
            <h1 className="text-3xl font-semibold text-slate-900">
              {loadingCourse ? "Loading course..." : course?.title ?? "Course detail"}
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-500">
              {course?.description ?? "Course information is loaded from the backend course module."}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                {course?.category ?? "Category"}
              </span>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {course?.level ?? "Level"}
              </span>
              {likes ? (
                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                  {toNumber(likes.like_count)} likes
                </span>
              ) : null}
            </div>
          </div>

          <div className="relative min-h-64 overflow-hidden rounded-[1.5rem] bg-slate-900">
            {courseThumbnail ? (
              <img src={courseThumbnail} alt={course?.title ?? "Course thumbnail"} className="h-full min-h-64 w-full object-cover" />
            ) : (
              <div className="flex h-full min-h-64 w-full items-center justify-center bg-[radial-gradient(circle_at_25%_20%,rgba(45,212,191,0.35),transparent_30%),linear-gradient(135deg,#0f766e,#164e63_55%,#0f172a)] text-white">
                <BookOpen className="h-14 w-14" />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-5">
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleToggleLike}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-base font-medium text-slate-700 transition hover:border-slate-300"
                >
                  {likes?.is_liked_by_current_user ? 
                  (<Heart className="h-4 w-4 text-blue-600 fill-red-500 text-red-500" />)
                  : (<Heart className="h-4 w-4 text-blue-600" />)}
                  {likes?.is_liked_by_current_user ? "Unlike" : "Like"}
                </button>
                {user?.role === "student" || user?.role === "admin" || user?.role === "super_admin" ? (
                  <Link
                    to={`/learn/${id}`}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-base font-medium text-slate-700 transition hover:border-slate-300"
                  >
                    <PlayCircle className="h-4 w-4 text-blue-600" />
                    Open learning page
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      {user?.role === "student" && course ? (
        <EnrollmentCard
          busy={enrollmentBusy}
          category={course.category}
          isEnrolled={isEnrolled}
          level={course.level}
          onEnroll={handleEnroll}
          onReview={() => setEnrollmentOpen(true)}
        />
      ) : null}

      {user?.role === "student" && dashboard ? (
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[2rem] bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total videos</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{dashboard.totalVideos}</p>
          </div>
          <div className="rounded-[2rem] bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Watched</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{dashboard.watchedVideos}</p>
          </div>
          <div className="rounded-[2rem] bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Progress</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{dashboard.Progress}%</p>
          </div>
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          {loadingVideos ? (
            <div className="rounded-[2rem] bg-white p-8 text-base text-slate-500 shadow-sm">
              Loading video module...
            </div>
          ) : videos.length > 0 ? (
            <VideoPlayer
              video={selectedVideo}
              canGoPrevious={selectedVideoIndex > 0}
              canGoNext={selectedVideoIndex >= 0 && selectedVideoIndex < videos.length - 1}
              onPrevious={() => handleMoveVideo("previous")}
              onNext={() => handleMoveVideo("next")}
            />
          ) : (
            <EmptyState
              title="Video access unavailable"
              description={videoAccessMessage || "No videos are available for this course."}
            />
          )}

          <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Discussion</h2>
                <p className="text-sm text-slate-500">
                  {comments.length} {comments.length === 1 ? "comment" : "comments"} on this course
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateComment} className="mt-5 space-y-3">
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Ask a question or share a note"
                className="min-h-28 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-slate-900 outline-none transition focus:border-primary-500 focus:bg-white"
              />
              <button
                type="submit"
                disabled={!comment.trim() || submittingComment}
                className="rounded-2xl bg-slate-900 px-5 py-3 text-base font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submittingComment ? "Posting..." : "Post comment"}
              </button>
            </form>

            <div className="mt-6 space-y-4">
              {loadingComments ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                  Loading comments...
                </div>
              ) : comments.length === 0 ? (
                <EmptyState
                  title="No comments yet"
                  description="Start the course discussion with the first comment."
                />
              ) : (
                comments.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-blue-100 text-sm font-semibold text-blue-700">
                        {item.user_profile_photo_url ? (
                          <img src={resolveMediaUrl(item.user_profile_photo_url)} alt={item.user_name || "User"} className="h-full w-full object-cover" />
                        ) : (
                          (item.user_name || "U").charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h3 className="font-semibold text-slate-900">{item.user_name || "Unknown user"}</h3>
                            <p className="text-xs text-slate-500">
                              {formatTimestamp(item.updated_at || item.created_at)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleCommentLike(item.id)}
                              className={[
                                "rounded-xl px-4 py-2 text-sm font-semibold transition flex gap-2 md:grid-cols-2",
                                item.is_liked_by_current_user
                                  ? "bg-blue-50 text-blue-700"
                                  : "bg-white text-slate-600 hover:text-blue-700",
                              ].join(" ")}
                            >
                              <Heart className={["h-4 w-4",
                               item.is_liked_by_current_user ? "text-blue-600 fill-red-500 text-red-500" : "text-blue-600"
                               ].join(" ")} />
                              {toNumber(item.like_count)} like
                            </button>
                            {user?.id === item.user_id ? (
                              <button
                                type="button"
                                onClick={() => void handleDeleteComment(item.id)}
                                disabled={deletingCommentId === item.id}
                                className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                                aria-label="Delete comment"
                              >
                                <Trash2 className="h-4 w-4" />
                                {deletingCommentId === item.id ? "Deleting" : "Delete"}
                              </button>
                            ) : null}
                          </div>
                        </div>
                        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-700">{item.comment}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[2rem] bg-white p-6 shadow-sm dark:bg-surface-dark">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Sections</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Course structure from the backend section module.
            </p>
            <div className="mt-4 space-y-3">
              {sections.length === 0 ? (
                <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-surface-dark dark:text-slate-400">
                  No sections returned.
                </p>
              ) : (
                sections.map((section) => (
                  <div key={section.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                    <p className="font-semibold text-slate-900 dark:text-white">{section.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                      Section {section.id} · {section.videos?.length ?? 0} videos · {files.filter((file) => file.section_id === section.id).length} files
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-sm dark:bg-surface-dark">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Resources</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Downloadable course files grouped by section when available.
            </p>
            <div className="mt-4 space-y-2">
              {files.length === 0 ? (
                <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-surface-dark dark:text-slate-400">
                  No resources returned.
                </p>
              ) : (
                files.map((file) => (
                  <button
                    key={file.id}
                    type="button"
                    onClick={() => void handleDownloadFile(file)}
                    className="block w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left text-sm font-medium text-slate-700 transition hover:border-blue-400 dark:border-slate-700 dark:bg-surface-dark dark:text-slate-200"
                  >
                    {file.file_name}
                    <span className="mt-1 block text-xs font-normal text-slate-400">Section {file.section_id}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Video list</h2>
            <p className="mt-2 text-sm text-slate-500">
              The list below only appears when the backend grants access.
            </p>
          </div>

          {loadingVideos ? (
            <div className="rounded-[2rem] bg-white p-6 text-base text-slate-500 shadow-sm">
              Loading videos...
            </div>
          ) : videos.length === 0 ? (
            <EmptyState
              title="No accessible videos"
              description={videoAccessMessage || "Nothing to list for this course."}
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

function EnrollmentWizard({
  status,
  currentStep,
  learningGoal,
  interestTopics,
  experienceLevel,
  learningMotivation,
  preferredDifficulty,
  studyTimePerWeek,
  acceptedAgreement,
  busy,
  onGoalChange,
  onInterestTopicsChange,
  onExperienceLevelChange,
  onLearningMotivationChange,
  onPreferredDifficultyChange,
  onStudyTimePerWeekChange,
  onAgreementChange,
  onClose,
  onCompleteStep,
}: {
  status: EnrollmentStatus;
  currentStep: EnrollmentStepId | "completed";
  learningGoal: string;
  interestTopics: string;
  experienceLevel: string;
  learningMotivation: string;
  preferredDifficulty: string;
  studyTimePerWeek: string;
  acceptedAgreement: boolean;
  busy: boolean;
  onGoalChange: (value: string) => void;
  onInterestTopicsChange: (value: string) => void;
  onExperienceLevelChange: (value: string) => void;
  onLearningMotivationChange: (value: string) => void;
  onPreferredDifficultyChange: (value: string) => void;
  onStudyTimePerWeekChange: (value: string) => void;
  onAgreementChange: (value: boolean) => void;
  onClose: () => void;
  onCompleteStep: (step: EnrollmentStepId) => void;
}) {
  const stepIndex = status.steps.findIndex((step) => step.id === currentStep);
  const activeIndex = currentStep === "completed" ? status.steps.length : Math.max(0, stepIndex);

  const canCompleteCurrentStep =
    currentStep === "requirements"
      ? status.canStart
      : currentStep === "learning_goal"
        ? learningGoal.trim().length >= 8 && Boolean(experienceLevel) && Boolean(preferredDifficulty)
        : currentStep === "agreement"
          ? acceptedAgreement
          : false;

  const stepIcon = (step: EnrollmentStepId) => {
    if (step === "requirements") return <ClipboardList className="h-5 w-5" />;
    if (step === "learning_goal") return <Target className="h-5 w-5" />;
    return <ShieldCheck className="h-5 w-5" />;
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
      <section className="liquid-card w-full max-w-3xl rounded-[2rem] p-5">
        <div className="flex items-start justify-between gap-4 rounded-[1.5rem] bg-slate-950 p-6 text-white dark:bg-[#06131f]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-200">Course enrollment</p>
            <h2 className="mt-3 text-2xl font-semibold">Join {status.course.title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Complete these steps so enrollment is intentional and course materials unlock only after confirmation.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-white/10 p-2 text-white transition hover:bg-white/20"
            aria-label="Close enrollment"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {status.steps.map((step, index) => {
            const isDone = index < activeIndex;
            const isCurrent = step.id === currentStep;

            return (
              <div
                key={step.id}
                className={[
                  "rounded-2xl border p-4 transition",
                  isCurrent
                    ? "border-primary-300 bg-primary-50 text-primary-900 dark:border-primary-400/35 dark:bg-primary-400/12 dark:text-primary-100"
                    : isDone
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-400/25 dark:bg-emerald-400/12 dark:text-emerald-100"
                      : "border-slate-200 bg-white/70 text-slate-600 dark:border-slate-700 dark:bg-surface-subtle dark:text-slate-300",
                ].join(" ")}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-white/10">
                    {isDone ? <CheckCircle2 className="h-5 w-5" /> : stepIcon(step.id)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{step.title}</p>
                    <p className="mt-1 text-xs leading-5 opacity-80">{step.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 rounded-[1.5rem] border border-slate-200 bg-white/72 p-5 backdrop-blur dark:border-slate-700 dark:bg-surface-dark/80">
          {currentStep === "requirements" ? (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Requirements check</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <p className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary-600" />
                  Course status: {status.course.status}
                </p>
                <p className="flex items-center gap-2">
                  {status.prerequisiteMet ? (
                    <CheckCircle2 className="h-4 w-4 text-primary-600" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                  {status.course.prerequisite_title
                    ? `Prerequisite: ${status.course.prerequisite_title} (${status.course.prerequisite_progress ?? 0}%)`
                    : "No prerequisite required"}
                </p>
              </div>
            </div>
          ) : currentStep === "learning_goal" ? (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Personalize your learning path</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                These answers help the rule-based recommendation engine choose better next courses later.
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="md:col-span-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Learning goal</span>
                  <textarea
                    value={learningGoal}
                    onChange={(event) => onGoalChange(event.target.value)}
                    placeholder="Example: I want to finish this course in two weeks and build a portfolio project."
                    className="mt-2 min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-900 outline-none transition focus:border-primary-500 dark:border-slate-700 dark:bg-surface-subtle dark:text-slate-100"
                  />
                </label>

                <label className="md:col-span-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Interests or topics</span>
                  <input
                    value={interestTopics}
                    onChange={(event) => onInterestTopicsChange(event.target.value)}
                    placeholder="Web development, databases, UI design"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 dark:border-slate-700 dark:bg-surface-subtle dark:text-slate-100"
                  />
                </label>

                <SelectField label="Current experience" value={experienceLevel} onChange={onExperienceLevelChange} options={["Beginner", "Intermediate", "Advanced"]} />
                <SelectField label="Preferred difficulty" value={preferredDifficulty} onChange={onPreferredDifficultyChange} options={["Beginner", "Intermediate", "Advanced"]} />

                <label>
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Motivation</span>
                  <input
                    value={learningMotivation}
                    onChange={(event) => onLearningMotivationChange(event.target.value)}
                    placeholder="Career change, exam prep, project work"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 dark:border-slate-700 dark:bg-surface-subtle dark:text-slate-100"
                  />
                </label>

                <SelectField label="Study time per week" value={studyTimePerWeek} onChange={onStudyTimePerWeekChange} options={["1-3 hours", "4-6 hours", "7-10 hours", "10+ hours"]} />
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Confirm enrollment</h3>
              <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 dark:border-slate-700 dark:bg-surface-subtle dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={acceptedAgreement}
                  onChange={(event) => onAgreementChange(event.target.checked)}
                  className="mt-1 h-4 w-4 accent-primary-600"
                />
                I understand this course will be added to my learning dashboard and progress will be tracked from backend activity.
              </label>
            </div>
          )}

          {currentStep !== "completed" ? (
            <button
              type="button"
              disabled={busy || !canCompleteCurrentStep}
              onClick={() => onCompleteStep(currentStep as EnrollmentStepId)}
              className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-primary-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {busy ? "Saving..." : currentStep === "agreement" ? "Complete enrollment" : "Continue"}
            </button>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function SelectField({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: string[];
  value: string;
}) {
  return (
    <label>
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 dark:border-slate-700 dark:bg-surface-subtle dark:text-slate-100"
      >
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function EnrollmentCard({
  busy,
  category,
  isEnrolled,
  level,
  onEnroll,
  onReview,
}: {
  busy: boolean;
  category: string;
  isEnrolled: boolean;
  level: string;
  onEnroll: () => void;
  onReview: () => void;
}) {
  return (
    <section className="rounded-[2rem] border border-primary-100 bg-white p-6 shadow-sm dark:border-primary-400/20 dark:bg-surface-dark">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-primary-50 p-3 text-primary-700 dark:bg-primary-400/12 dark:text-primary-100">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary-700 dark:text-primary-200">
              {isEnrolled ? "Enrollment active" : "Ready to enroll"}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
              {isEnrolled ? "Your learning materials are unlocked." : "Join this course and start learning step by step."}
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">{category}</span>
              <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-400/12 dark:text-primary-100">{level}</span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={isEnrolled ? onReview : onEnroll}
          disabled={busy}
          className="inline-flex items-center justify-center rounded-2xl bg-primary-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-900/15 transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isEnrolled ? "Review enrollment" : busy ? "Starting..." : "Enroll now"}
        </button>
      </div>
    </section>
  );
}
