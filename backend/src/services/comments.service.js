import pool from "../config/db.js"

export const getCommentsByCourseService = async (courseId, userId) => {
    const query = `
    SELECT  
        c.id,
        c.comment,
        c.user_id,
        c.course_id,
        c.created_at,
        c.updated_at,
        u.full_name AS user_name,
        -- UPDATED - PROFILE PHOTO FEATURE: return author avatar for comment UI.
        u.profile_photo_url AS user_profile_photo_url,

        COUNT(lc.id) AS like_count,

        CASE 
            WHEN MAX(CASE WHEN lc.user_id = $2 THEN 1 ELSE 0 END) = 1 
            THEN true 
            ELSE false 
        END AS is_liked_by_current_user

    FROM comments c
    JOIN users u ON c.user_id = u.id
    LEFT JOIN like_comments lc ON c.id = lc.comment_id

    WHERE c.course_id = $1
    GROUP BY c.id, u.full_name, u.profile_photo_url
    ORDER BY c.created_at DESC;
    `;
    
    const { rows } = await pool.query(query, [courseId, userId]);
    return rows;
};

export const createCommentService = async (userId, courseId, comment) => {
    const query = `
    INSERT INTO comments (user_id, course_id, comment)
    VALUES ($1, $2, $3) RETURNING *
    `;

    const { rows } = await pool.query(query, [
        userId, courseId, comment
    ]);
    return rows[0];
};

export const updateCommentService = async (comment, commentId, userId) => {
    const checkQuery = `
    SELECT user_id FROM comments WHERE id = $1
    `;

    const { rows } = await pool.query(checkQuery, [commentId]);

    if (rows.length === 0) {
        throw new Error("Comment not found");
    }

    if (userId !== rows[0].user_id) {
        throw new Error("Not authorized");
    }

    const updateQuery = `
        UPDATE comments
        SET comment = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING *;
    `;

    const result = await pool.query(updateQuery, [comment, commentId]);
    return result.rows[0];
};

//toggle(like if you didn't, unlike if you did like) like for a comment;
export const toggleLikeService = async (commentId, userId) => {
    // checking if liked befor
    const checkQuery = `
    SELECT id FROM like_comments
    WHERE comment_id = $1 AND user_id = $2
    `;

    const { rows } = await pool.query(checkQuery, [commentId, userId]);

    if(rows.length > 0) {
        // if liked before, then unlike
        await pool.query(
            `DELETE FROM like_comments
            WHERE comment_id = $1 AND user_id = $2`,
            [commentId, userId]
        );

        return {
            liked: false,
            message: "Unlike successfully"
        }
    } else {
        // if didn't like then like
        await pool.query(
            `INSERT INTO like_comments (comment_id, user_id)
            VALUES ($1, $2)`,
            [commentId, userId]
        );

        return {
            liked: true,
            message: "Liked successfully"
        };
    }
};

// show users who liked the comments
export const showLikesService = async (commentId, userId) => {
    const likesQuery = `
        -- UPDATED - PROFILE PHOTO FEATURE: return avatars for users who liked comments.
        SELECT l.id, l.user_id, u.full_name, u.profile_photo_url
        FROM like_comments l
        JOIN users u ON l.user_id = u.id
        WHERE l.comment_id = $1
        ORDER BY l.created_at DESC;
    `;
    const { rows: likes } = await pool.query(likesQuery, [commentId]);

    const metaQuery = `
        SELECT 
            COUNT(*) AS like_count,
            CASE WHEN MAX(CASE WHEN user_id = $2 THEN 1 ELSE 0 END) = 1 
                 THEN true ELSE false 
            END AS is_liked_by_current_user
        FROM like_comments
        WHERE comment_id = $1;
    `;
    const { rows: metaRows } = await pool.query(metaQuery, [commentId, userId]);
    const metadata = metaRows[0];

    return {
        like_count: metadata.like_count,
        is_liked_by_current_user: metadata.is_liked_by_current_user,
        likes: likes
    };
};


export const deleteCommentService = async (commentId, userId) => {
    const query = `
    DELETE FROM comments 
    WHERE id = $1 AND user_id = $2
    RETURNING *;
    `;

    const { rowCount } = await pool.query(query, [commentId, userId]);
    
    if (rowCount === 0) {
        throw new Error("Comment not found or not authorized");
    }
};

