import pool from "../config/db.js";
import fs from "fs/promises";
import path from "path";

const publicUploadUrl = (file) => {
    if (!file?.path) return null;

    const normalized = file.path.replace(/\\/g, "/");
    const marker = "/uploads/";
    const markerIndex = normalized.lastIndexOf(marker);

    if (markerIndex >= 0) {
        return normalized.slice(markerIndex);
    }

    return `/uploads/courses/thumbnails/${file.filename}`;
};

const deleteLocalThumbnail = async (thumbnailUrl) => {
    if (!thumbnailUrl || !thumbnailUrl.startsWith("/uploads/")) return;

    const localPath = path.resolve(thumbnailUrl.replace(/^\/+/, ""));

    try {
        await fs.unlink(localPath);
    } catch (error) {
        if (error.code !== "ENOENT") {
            throw error;
        }
    }
};

/**
 *  Create course (teacher)
 */
export const createCourseService = async (data, teacherId, thumbnailFile = null) => {
    const {
        title,
        description,
        category,
        level,
        prerequisite_course_id,
    } = data;
    const thumbnailUrl = publicUploadUrl(thumbnailFile);

    const query = `INSERT INTO courses 
    (title, description, category, "level", prerequisite_course_id, teacher_id, thumbnail_url)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`;

    const { rows } = await pool.query(query, [
        title.trim(),
        description,
        category.trim(),
        level,
        prerequisite_course_id || null,
        teacherId,
        thumbnailUrl
    ]);

    return rows[0];
}

/**
 *  Update course
 */
export const updateCourseService = async (courseId, data, thumbnailFile = null) => {
    try {
        const {
            title,
            description,
            category,
            level,
            prerequisite_course_id,
        } = data;
        const thumbnailUrl = publicUploadUrl(thumbnailFile);

        const existing = await pool.query(
            "SELECT thumbnail_url FROM courses WHERE id = $1",
            [courseId]
        );

        if (existing.rows.length === 0) {
            return null;
        }

        const query = `
        UPDATE courses
        SET title=$1,
            description=$2,
            category=$3,
            level=$4,
            prerequisite_course_id=$5,
            thumbnail_url=COALESCE($6, thumbnail_url),
            updated_at=NOW()
        WHERE id=$7 RETURNING *
        `;

        const { rows } = await pool.query(query, [
            title,
            description,
            category,
            level,
            prerequisite_course_id,
            thumbnailUrl,
            courseId
        ]);

        if (thumbnailUrl && existing.rows[0].thumbnail_url !== thumbnailUrl) {
            await deleteLocalThumbnail(existing.rows[0].thumbnail_url);
        }

        return rows[0];
    } catch (error) {
        throw error;
    }
}

export const replaceCourseThumbnailService = async (courseId, userId, role, thumbnailFile) => {
    if (!thumbnailFile) {
        throw new Error("Course thumbnail image is required");
    }

    const currentResult = await pool.query(
        "SELECT id, teacher_id, thumbnail_url FROM courses WHERE id = $1",
        [courseId]
    );

    const current = currentResult.rows[0];
    if (!current) {
        return null;
    }

    if (role === "teacher" && current.teacher_id !== userId) {
        throw new Error("You can update thumbnails only for your own courses");
    }

    const thumbnailUrl = publicUploadUrl(thumbnailFile);
    const { rows } = await pool.query(
        `
        UPDATE courses
        SET thumbnail_url = $1,
            updated_at = NOW()
        WHERE id = $2
        RETURNING *
        `,
        [thumbnailUrl, courseId]
    );

    if (current.thumbnail_url !== thumbnailUrl) {
        await deleteLocalThumbnail(current.thumbnail_url);
    }

    return rows[0];
};

export const removeCourseThumbnailService = async (courseId, userId, role) => {
    const currentResult = await pool.query(
        "SELECT id, teacher_id, thumbnail_url FROM courses WHERE id = $1",
        [courseId]
    );

    const current = currentResult.rows[0];
    if (!current) {
        return null;
    }

    if (role === "teacher" && current.teacher_id !== userId) {
        throw new Error("You can remove thumbnails only for your own courses");
    }

    const { rows } = await pool.query(
        `
        UPDATE courses
        SET thumbnail_url = NULL,
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
        `,
        [courseId]
    );

    await deleteLocalThumbnail(current.thumbnail_url);

    return rows[0];
};


/**
* Get all courses
*/
export const getAllCoursesService = async (userId, role) => {
    const query = `
    SELECT
        c.id,
        c.title,
        c.description,
        c.category,
        c."level",
        c.prerequisite_course_id,
        c.thumbnail_url,
        c.teacher_id,
        c.status,
        c.created_at,
        u.full_name AS teacher_name,
        u.email AS teacher_email,
        -- UPDATED - PROFILE PHOTO FEATURE: expose instructor profile details for course cards.
        u.profile_photo_url AS teacher_profile_photo_url,
        u.bio AS teacher_bio,
        u.expertise AS teacher_expertise,
        u.experience AS teacher_experience
    FROM courses c
    JOIN users u ON c.teacher_id = u.id
    WHERE c.status = 'active'
    AND ($1::text != 'teacher' OR c.teacher_id = $2)
    ORDER BY c.created_at DESC
  `;

    const { rows } = await pool.query(query, [role, userId]);
    return rows;
}

/**
 * Get single course
 */
export const getCourseByIdService = async (courseId) => {
    const { rows } = await pool.query(
        `SELECT
            c.id,
            c.title,
            c.description,
            c.category,
            c."level",
            c.prerequisite_course_id,
            c.thumbnail_url,
            c.teacher_id,
            c.status,
            c.created_at,
            u.full_name AS teacher_name,
            u.email AS teacher_email,
            -- UPDATED - PROFILE PHOTO FEATURE: expose instructor profile details for course detail.
            u.profile_photo_url AS teacher_profile_photo_url,
            u.bio AS teacher_bio,
            u.expertise AS teacher_expertise,
            u.experience AS teacher_experience
        FROM courses c
        JOIN users u ON c.teacher_id = u.id
        WHERE c.id = $1`,
        [courseId]
    );

    return rows[0];
};

/**
 * Dashboard for a course enrolled with a student
 */
export const getCourseDashboardService = async (userId, courseId) => {
    const query = `
        SELECT
            COUNT(v.id) AS "totalVideos",
            COUNT(vw.id) AS "watchedVideos",
            CASE
                WHEN COUNT(v.id) > 0 AND COUNT(v.id) = COUNT(vw.id)
                THEN true
                ELSE false
            END AS "isCompleted"
        FROM course_videos v
        LEFT JOIN video_watches vw
            ON v.id = vw.video_id
            AND vw.user_id = $1
        WHERE v.course_id = $2
    `;
    const { rows } = await pool.query(query, [userId, courseId]);

     const progressQuery = `
        SELECT progress_percent FROM progress
        WHERE user_id = $1 AND course_id = $2
    `;

    const progressResult = await pool.query(progressQuery, [userId, courseId]);

    const progress =
        progressResult.rows.length > 0
            ? progressResult.rows[0].progress_percent
            : 0;

    return {
        totalVideos:  rows[0].totalVideos,
        watchedVideos: rows[0].watchedVideos,
        isCompleted: rows[0].isCompleted,
        Progress: progress
    };
};

/**
 * Delete course
 */
export const deleteCourseService = async (courseId) => {
    const query = `
    DELETE FROM courses WHERE id = $1
    `;

    await pool.query(query, [courseId]);
}

