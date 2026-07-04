import pool from "../config/db.js";
import { recalculateCourseProgress } from "./progress.service.js";
import fs from "fs";

const assertCourseAccess = async (courseId, userId, role) => {
  if (role === "admin" || role === "super_admin") {
    return;
  }

  if (role === "teacher") {
    const ownershipQuery = `
      SELECT id FROM courses
      WHERE id = $1 AND teacher_id = $2
    `;

    const ownership = await pool.query(ownershipQuery, [courseId, userId]);

    if (ownership.rows.length === 0) {
      throw new Error("Access denied");
    }

    return;
  }

  if (role === "student") {
    const enrollQuery = `
      SELECT id FROM enrollments
      WHERE user_id = $1 AND course_id = $2
      AND status = 'active'
    `;

    const enrollment = await pool.query(enrollQuery, [userId, courseId]);

    if (enrollment.rows.length === 0) {
      throw new Error("Access denied: Not enrolled");
    }

    return;
  }

  throw new Error("Access denied");
};

/**
 * Create URL Video (YouTube or external)
 */
export const createVideoService = async (
  courseId,
  sectionId,
  teacherId,
  title,
  description,
  video_url,
  thumbnail_url,
  duration,
  position
) => {
  // UPDATED FEATURE: duration defaults to 0 when external providers do not expose metadata.
  duration = Number(duration) || 0;

  // Ownership + section ownership check
  const ownershipQuery = `
    SELECT c.id
    FROM courses c
    JOIN course_sections cs ON cs.course_id = c.id
    WHERE c.id = $1
      AND cs.id = $2
      AND c.teacher_id = $3
  `;

  const ownership = await pool.query(ownershipQuery, [
    courseId,
    sectionId,
    teacherId
  ]);

  if (ownership.rows.length === 0) {
    throw new Error("Access denied: Invalid course or section");
  }

  // Auto position (if not provided)
  if (!position) {
    const posQuery = `
      SELECT COALESCE(MAX(position), 0) + 1 AS next_position
      FROM course_videos
      WHERE section_id = $1
    `;
    const posRes = await pool.query(posQuery, [sectionId]);
    position = posRes.rows[0].next_position;
  }

  const insertQuery = `
    INSERT INTO course_videos
    (course_id, section_id, title, description, video_url, thumbnail_url, duration, position)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *;
  `;

  const { rows } = await pool.query(insertQuery, [
    courseId,
    sectionId,
    title,
    description,
    video_url,
    thumbnail_url,
    duration,
    position
  ]);

  return rows[0];
};

/**
 * Upload Video (LOCAL FILE)
 */
export const uploadVideoService = async (
  courseId,
  sectionId,
  teacherId,
  title,
  description,
  video_path,
  duration,
  position
) => {
  // UPDATED FEATURE: duration is supplied by frontend metadata detection when available.
  duration = Number(duration) || 0;

  // Ownership + section ownership check
  const ownershipQuery = `
    SELECT c.id
    FROM courses c
    JOIN course_sections cs ON cs.course_id = c.id
    WHERE c.id = $1
      AND cs.id = $2
      AND c.teacher_id = $3
  `;

  const ownership = await pool.query(ownershipQuery, [
    courseId,
    sectionId,
    teacherId
  ]);

  if (ownership.rows.length === 0) {
    throw new Error("Access denied: Invalid course or section");
  }

  // Auto position
  if (!position) {
    const posQuery = `
      SELECT COALESCE(MAX(position), 0) + 1 AS next_position
      FROM course_videos
      WHERE section_id = $1
    `;
    const posRes = await pool.query(posQuery, [sectionId]);
    position = posRes.rows[0].next_position;
  }

  const insertQuery = `
    INSERT INTO course_videos
    (course_id, section_id, title, description, video_type, video_path, duration, position)
    VALUES ($1,$2,$3,$4,'upload',$5,$6,$7)
    RETURNING *;
  `;

  const { rows } = await pool.query(insertQuery, [
    courseId,
    sectionId,
    title,
    description,
    video_path,
    duration,
    position
  ]);

  return rows[0];
};

/**
 * Get single video (for streaming)
 */
export const getVideoByIdService = async (videoId) => {
  const query = `
    SELECT *
    FROM course_videos
    WHERE id = $1
  `;

  const { rows } = await pool.query(query, [videoId]);

  if (rows.length === 0) {
    throw new Error("Video not found");
  }

  return rows[0];
};

export const getAccessibleVideoByIdService = async (videoId, userId, role) => {
  const video = await getVideoByIdService(videoId);

  await assertCourseAccess(video.course_id, userId, role);

  return video;
};

/**
 * Get all videos (with access control)
 */
export const getCourseVideosService = async (
  courseId,
  userId,
  role
) => {
  await assertCourseAccess(courseId, userId, role);

  const query = `
    SELECT *
    FROM course_videos
    WHERE course_id = $1
    ORDER BY position ASC;
  `;

  const { rows } = await pool.query(query, [courseId]);

  return rows;
};

/**
 * Get videos with progress + status
 */
export const getCourseVideosWithStatusService = async (
  userId,
  courseId,
  role
) => {
  await assertCourseAccess(courseId, userId, role);

  const query = `
    SELECT 
      v.id,
      v.course_id,
      v.section_id,
      v.title,
      v.description,
      v.video_type,
      v.video_url,
      v.video_path,
      v.thumbnail_url,
      v.duration,
      v.position,

      COALESCE(vw.progress_seconds, 0) AS progress_seconds,

      CASE 
        WHEN vw.completed = true THEN true
        ELSE false
      END AS "isWatched"

    FROM course_videos v

    LEFT JOIN video_watches vw
      ON v.id = vw.video_id
      AND vw.user_id = $1

    WHERE v.course_id = $2

    ORDER BY v.position ASC;
  `;

  const { rows } = await pool.query(query, [userId, courseId]);

  return rows;
};

/**
 * Update video progress (REAL)
 */
export const updateVideoProgressService = async (
  videoId,
  userId,
  progress_seconds
) => {

  // Check video
  const videoQuery = `
    SELECT course_id, duration
    FROM course_videos
    WHERE id = $1
  `;

  const videoResult = await pool.query(videoQuery, [videoId]);

  if (videoResult.rows.length === 0) {
    throw new Error("Video not found");
  }

  const { course_id, duration } = videoResult.rows[0];

  // Check enrollment
  const enrollQuery = `
    SELECT id FROM enrollments
    WHERE user_id = $1 AND course_id = $2
    AND status = 'active'
  `;

  const enrollment = await pool.query(enrollQuery, [
    userId,
    course_id
  ]);

  if (enrollment.rows.length === 0) {
    throw new Error("Not enrolled");
  }

  // Determine completed (90%)
  const completed = progress_seconds >= duration * 0.9;

  const progressQuery = `
    INSERT INTO video_watches (user_id, video_id, progress_seconds, completed)
    VALUES ($1,$2,$3,$4)
    ON CONFLICT (user_id, video_id)
    DO UPDATE SET
      progress_seconds = EXCLUDED.progress_seconds,
      completed = EXCLUDED.completed,
      watched_at = CURRENT_TIMESTAMP
  `;

  await pool.query(progressQuery, [
    userId,
    videoId,
    progress_seconds,
    completed
  ]);

  // KEEP THIS (IMPORTANT)
  const progressPercent = await recalculateCourseProgress(
    userId,
    course_id
  );

  return {
    courseId: course_id,
    progressPercent
  };
};

/**
 * Delete video
 */
export const deleteVideoService = async (
  videoId,
  teacherId
) => {

  // get video info
  const videoQuery = `
    SELECT
      course_id,
      video_type,
      video_path
    FROM course_videos
    WHERE id = $1
  `;

  const videoResult =
    await pool.query(videoQuery,[videoId]);

  // first check exists
  if(videoResult.rows.length===0){
     throw new Error("Video not found");
  }

  const video=videoResult.rows[0];

  const courseId=video.course_id;

  // ownership check
  const ownershipQuery=`
    SELECT id
    FROM courses
    WHERE id=$1
    AND teacher_id=$2
  `;

  const ownership=
    await pool.query(
      ownershipQuery,
      [courseId,teacherId]
    );

  if(ownership.rows.length===0){
     throw new Error("Access denied");
  }


  // delete physical uploaded file
  if(
    video.video_type==="upload" &&
    video.video_path
  ){

    const filePath=
      video.video_path.replace(/^\//,"");

    if(fs.existsSync(filePath)){
       fs.unlinkSync(filePath);
    }
  }


  // delete db record
  const deleteQuery=`
     DELETE FROM course_videos
     WHERE id=$1
  `;

  await pool.query(deleteQuery,[videoId]);

};
