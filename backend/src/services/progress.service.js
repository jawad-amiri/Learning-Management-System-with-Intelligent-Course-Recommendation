import pool from "../config/db.js";

/**
 * ===========================================
 * recalculating the progress 60% based on watched videos
 * 20% based on teacher manual progress,
 * 20% based on downloaded files
 * ===========================================
 */
export const recalculateCourseProgress = async (userId, courseId) => {
    //1-total videos
    const totalVideoQuery = `
    SELECT COUNT(*) FROM course_videos
    WHERE course_id = $1`;

    const totalVideoResult = await pool.query(totalVideoQuery, [courseId]);
    const totalVideos = parseInt(totalVideoResult.rows[0].count);

    //2-watched videos
    const watchedQuery = `
    SELECT COUNT(*) FROM video_watches vw
        JOIN course_videos cv ON vw.video_id = cv.id
        WHERE vw.user_id = $1 AND cv.course_id = $2
        `;

    const watchedResult = await pool.query(watchedQuery, [userId, courseId]);
    const watcehVideos = parseInt(watchedResult.rows[0].count);

    const videoRatio = totalVideos === 0 ? 0 : watcehVideos / totalVideos;

    //3-total files
    const totalFilesQuery = `
    SELECT COUNT(*) FROM course_files
    WHERE course_id = $1`;
    const totalFilesResult = await pool.query(totalFilesQuery, [courseId]);
    const totalFiles = parseInt(totalFilesResult.rows[0].count);

    //4-downloaded files
    const downloadedQuery = `
    SELECT COUNT(*) FROM file_downloads fd
    JOIN course_files cf ON fd.file_id = cf.id
    WHERE fd.user_id = $1 AND cf.course_id = $2`;
    const downloadedResult = await pool.query(downloadedQuery, [userId, courseId]);
    const downloadedFiles = parseInt(downloadedResult.rows[0].count);

    const fileRatio = totalFiles === 0 ? 0 : downloadedFiles / totalFiles;

    //5-manual percent
    const manualQuery = `
    SELECT manual_percent FROM progress
    WHERE user_id = $1 AND course_id = $2`;
    const manualResult = await pool.query(manualQuery, [userId, courseId]);
    const manualPercent = manualResult.rows.length > 0 ? manualResult.rows[0].manual_percent : 0;

    //6-FINAL CALCULATION
    const finalProgress = Math.floor((videoRatio * 60) + (fileRatio * 20) + manualPercent);

    //7-upsert progress
    const upsertProgress = `
    INSERT INTO progress (user_id, course_id, progress_percent, manual_percent)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id, course_id)
    DO UPDATE SET 
        progress_percent = EXCLUDED.progress_percent,
        manual_percent = EXCLUDED.manual_percent`;

    await pool.query(upsertProgress, [
        userId, courseId, finalProgress, manualPercent
    ]);

    if (finalProgress === 100) {
        await pool.query(`
            INSERT INTO certificates (user_id, course_id, status)
            VALUES ($1, $2, 'pending') 
            ON CONFLICT (user_id, course_id) DO NOTHING`, [
            userId, courseId
        ]);
    }
    return finalProgress;
};

/**
 * ==================================================================================================
 */

export const updateProgressService = async (userId, courseId, percent) => {

    percent = Number(percent);

    if (isNaN(percent) || percent < 0 || percent > 20) {
        throw new Error("Progress must be between 0 and 20");
    }

    const checkEnrollment = `
        SELECT 1 FROM enrollments
        WHERE user_id = $1 AND course_id = $2
        AND status = 'active'
    `;

    const { rows } = await pool.query(checkEnrollment, [userId, courseId]);

    if (rows.length === 0) {
        throw new Error("Student is not enrolled in this course");
    }

    const query = `
        INSERT INTO progress (user_id, course_id, progress_percent, manual_percent)
        VALUES ($1, $2, 0, $3)
        ON CONFLICT (user_id, course_id)
        DO UPDATE SET
            manual_percent = EXCLUDED.manual_percent,
            last_updated = CURRENT_TIMESTAMP
        RETURNING *
    `;

    await pool.query(query, [userId, courseId, percent]);

    const finalProgress = await recalculateCourseProgress(userId, courseId);

    return { progress: finalProgress };
};  

export const getMyProgressService = async (userId) => {
    const query = `
        SELECT
      c.title,
      p.progress_percent,
      p.last_updated
    FROM progress p
    JOIN courses c ON p.course_id = c.id
    WHERE p.user_id = $1
    `;

    const { rows } = await pool.query(query, [userId]);

    if (rows.length === 0) {
        throw new Error("No progress found");
    }

    return rows;
};
