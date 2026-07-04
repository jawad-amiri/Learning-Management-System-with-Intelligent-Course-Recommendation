import pool from "../config/db.js";

export const getDashboardDataService = async (userId, role) => {
    let data = {};

    switch (role) {
        case "super_admin":
            const userResult = await pool.query(`
                SELECT
                    u.id,
                    u.full_name,
                    u.email, 
                    -- UPDATED - PROFILE PHOTO FEATURE: show profile photo on user cards.
                    u.profile_photo_url,
                    r.role_name,
                    u.created_at
                FROM users u 
                JOIN roles r ON u.role_id = r.id
                ORDER BY u.created_at DESC
                `);

            const courseResult = await pool.query(`
                SELECT 
                    c.id,
                    c.title,
                    c.status,
                    c.thumbnail_url,
                    u.full_name AS teacher_name,
                    -- UPDATED - PROFILE PHOTO FEATURE: include teacher avatar in super admin dashboard.
                    u.profile_photo_url AS teacher_profile_photo_url,
                    c.created_at
                FROM courses c
                JOIN users u ON c.teacher_id = u.id
                ORDER BY c.created_at DESC
                `);

            data = {
                users: userResult.rows,
                courses: courseResult.rows,
                total_users: userResult.rows.length,
                total_courses: courseResult.rows.length
            }
            break;

        case "admin":
            const allCourses = await pool.query(`
                SELECT
                    c.id,
                    c.title,
                    c.status,
                    c.thumbnail_url,
                    u.full_name AS teacher_name,
                    -- UPDATED - PROFILE PHOTO FEATURE: include teacher avatar in admin dashboard.
                    u.profile_photo_url AS teacher_profile_photo_url
                FROM courses c
                JOIN users u ON 
                c.teacher_id = u.id
            `);

            const totalUsers = await pool.query(`
                SELECT COUNT(*) AS count FROM users
                `);

            const activeCourses = await pool.query(`
                SELECT COUNT(*) AS count
                FROM courses WHERE status ='active'`
            );

            data = {
                courses: allCourses.rows,
                total_users: parseInt(totalUsers.rows[0].count),
                activeCourses: parseInt(activeCourses.rows[0].count)
            };
            break;

        case "teacher":
            const teacherCourses = await pool.query(`
                SELECT 
                    c.id, 
                    c.title,
                    c.status,
                    c.thumbnail_url,
                    -- UPDATED - PROFILE PHOTO FEATURE: include teacher avatar on own course rows.
                    u.profile_photo_url AS teacher_profile_photo_url,
                    COUNT(e.id) AS enrolled_students,
                    COALESCE(AVG(p.progress_percent),0) AS avg_progress
                FROM courses c 
                JOIN users u ON c.teacher_id = u.id
                LEFT JOIN enrollments e ON e.course_id = c.id AND e.status = 'active'
                LEFT JOIN progress p ON  p.course_id = c.id
                WHERE c.teacher_id = $1
                GROUP BY c.id, u.profile_photo_url
                ORDER BY c.created_at DESC
                `, [userId]);

            data = {
                courses: teacherCourses.rows,
                total_courses: teacherCourses.rows.length,
                total_students: teacherCourses.rows.reduce(
                    (acc, c) => acc + parseInt(c.enrolled_students),
                    0
                )
            };
            break;

        case "student":
            const enrolledCourses = await pool.query(`
                SELECT 
                    c.id, 
                    c.title,
                    c.status,
                    c.thumbnail_url,
                    r.role_name AS teacher_role,
                    u.full_name AS teacher_name,
                    -- UPDATED - PROFILE PHOTO FEATURE: include teacher avatar in student dashboard.
                    u.profile_photo_url AS teacher_profile_photo_url,
                    
                    COALESCE(p.progress_percent, 0) AS progress_percent,
                    CASE WHEN 
                        COALESCE(p.progress_percent, 0) = 100
                        THEN true ELSE false END AS is_completed,
                    (SELECT COUNT(*) FROM course_videos cv
                    LEFT JOIN video_watches vw 
                        ON vw.video_id = cv.id AND vw.user_id = $1
                    WHERE cv.course_id = c.id) AS videos_watched
                    FROM enrollments e 
                    JOIN courses c ON e.course_id = c.id
                    JOIN users u ON c.teacher_id = u.id
                    JOIN roles r ON u.role_id = r.id
                    LEFT JOIN progress p ON p.course_id = c.id 
                    AND p.user_id = $1
                    WHERE E.user_id = $1
                    AND e.status = 'active'
                    ORDER BY c.created_at DESC
                `, [userId]);

            data = {
                course: enrolledCourses.rows,
                total_courses: enrolledCourses.rows.length,
                completed_courses: enrolledCourses.rows.filter(c => c.is_completed).length
            }
            break;

        default:
            throw new Error("Invalid role");
    }
    return data;
}

