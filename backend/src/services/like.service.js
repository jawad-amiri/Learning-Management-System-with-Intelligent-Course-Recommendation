import pool from "../config/db.js";

export const toggleCourseLikeService = async (courseId, userId) => {
    const checkCourseQuery = `
    SELECT id FROM courses WHERE id = $1
    `;
    const { rows: courseRows } = await pool.query(checkCourseQuery, [courseId]);

    if (courseRows.length === 0) {
        throw new Error("Course not found");
    }
    const checkQuery = `
    SELECT id FROM like_courses 
    WHERE user_id = $1 AND course_id = $2
    `;

    const { rows } = await pool.query(checkQuery, [userId, courseId]);

    if (rows.length > 0) {
        await pool.query(
            `DELETE FROM like_courses 
            WHERE user_id = $1 AND course_id = $2`,
            [userId, courseId]
        );
        return {
            liked: false,
            message: "Course unliked successfully"
        };
    } else {
        await pool.query(
            `INSERT INTO like_courses (user_id, course_id) 
            VALUES ($1, $2)`,
            [userId, courseId]
        );
        return {
            liked: true,
            message: "Course liked successfully"
        };
    }
};

export const getCourseLikesService = async (courseId, userId) => {
    const checkCourseQuery = `
    SELECT id FROM courses WHERE id = $1
    `;
    const { rows: courseRows } = await pool.query(checkCourseQuery, [courseId]);

    if (courseRows.length === 0) {
        throw new Error("Course not found");
    }
    
    const query = `
    SELECT
        l.id,
        l.user_id,
        u.full_name AS user_name
    FROM like_courses l 
    JOIN users u ON l.user_id = u.id
    WHERE l.course_id = $1`;

    const { rows: likes } = await pool.query(query, [courseId]);

    const metaQuery = `
    SELECT
        COUNT(*) AS like_count,
        CASE WHEN MAX(CASE WHEN user_id = $2 THEN 1 ELSE 0 END) = 1
            THEN true
            ELSE false
        END AS is_liked_by_current_user
    FROM like_courses
    WHERE course_id = $1`;

    const { rows: metaLikeDate } = await pool.query(
        metaQuery, 
        [courseId, userId]
    );
    console.log(metaLikeDate);
    

    return {
        like_count: metaLikeDate[0].like_count,
        is_liked_by_current_user: metaLikeDate[0].is_liked_by_current_user,
        likes
    }
};