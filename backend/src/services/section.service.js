import pool from "../config/db.js";

const assertTeacherOwnsCourse = async (teacherId, courseId) => {
  const { rows } = await pool.query(
    "SELECT id FROM courses WHERE id = $1 AND teacher_id = $2",
    [courseId, teacherId]
  );

  if (rows.length === 0) {
    throw new Error("Access denied: Course not found or not owned by teacher");
  }
};

const assertCourseAccess = async (userId, role, courseId) => {
  if (role === "admin" || role === "super_admin") return;

  if (role === "teacher") {
    await assertTeacherOwnsCourse(userId, courseId);
    return;
  }

  if (role === "student") {
    const { rows } = await pool.query(
      "SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2 AND status = 'active'",
      [userId, courseId]
    );

    if (rows.length === 0) {
      throw new Error("Access denied: Not enrolled");
    }

    return;
  }

  throw new Error("Access denied");
};

export const createSectionService = async (teacherId, courseId, title, position) => {
  await assertTeacherOwnsCourse(teacherId, courseId);

  if (!position) {
    const pos = await pool.query(
      "SELECT COALESCE(MAX(position), 0) + 1 AS next_position FROM course_sections WHERE course_id = $1",
      [courseId]
    );
    position = pos.rows[0].next_position;
  }

  const { rows } = await pool.query(
    `INSERT INTO course_sections (course_id, title, position)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [courseId, title.trim(), position]
  );

  return rows[0];
};

export const getCourseSectionsService = async (userId, role, courseId) => {
  await assertCourseAccess(userId, role, courseId);

  const { rows } = await pool.query(
    `SELECT
      cs.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', cv.id,
            'title', cv.title,
            'description', cv.description,
            'video_type', cv.video_type,
            'video_url', cv.video_url,
            'video_path', cv.video_path,
            'thumbnail_url', cv.thumbnail_url,
            'duration', cv.duration,
            'position', cv.position
          )
          ORDER BY cv.position
        ) FILTER (WHERE cv.id IS NOT NULL),
        '[]'
      ) AS videos
    FROM course_sections cs
    LEFT JOIN course_videos cv ON cv.section_id = cs.id
    WHERE cs.course_id = $1
    GROUP BY cs.id
    ORDER BY cs.position ASC`,
    [courseId]
  );

  return rows;
};

export const updateSectionService = async (teacherId, sectionId, title, position) => {
  const ownership = await pool.query(
    `SELECT cs.id
     FROM course_sections cs
     JOIN courses c ON c.id = cs.course_id
     WHERE cs.id = $1 AND c.teacher_id = $2`,
    [sectionId, teacherId]
  );

  if (ownership.rows.length === 0) {
    throw new Error("Access denied");
  }

  const { rows } = await pool.query(
    `UPDATE course_sections
     SET title = COALESCE($1, title),
         position = COALESCE($2, position)
     WHERE id = $3
     RETURNING *`,
    [title?.trim() || null, position || null, sectionId]
  );

  return rows[0];
};

export const deleteSectionService = async (teacherId, sectionId) => {
  const result = await pool.query(
    `DELETE FROM course_sections cs
     USING courses c
     WHERE cs.course_id = c.id
     AND cs.id = $1
     AND c.teacher_id = $2`,
    [sectionId, teacherId]
  );

  if (result.rowCount === 0) {
    throw new Error("Section not found or access denied");
  }
};
