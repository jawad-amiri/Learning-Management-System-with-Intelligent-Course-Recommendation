import pool from "../config/db.js";
import fs from "fs";

const assertCourseAccess = async (userId, role, courseId) => {
  if (role === "admin" || role === "super_admin") return;

  if (role === "teacher") {
    const { rows } = await pool.query(
      "SELECT id FROM courses WHERE id = $1 AND teacher_id = $2",
      [courseId, userId]
    );

    if (rows.length === 0) throw new Error("Access denied");
    return;
  }

  if (role === "student") {
    const { rows } = await pool.query(
      "SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2 AND status = 'active'",
      [userId, courseId]
    );

    if (rows.length === 0) throw new Error("Access denied: Not enrolled");
    return;
  }

  throw new Error("Access denied");
};

export const uploadCourseFileService = async (teacherId, courseId, sectionId, file) => {
  const ownership = await pool.query(
    `SELECT c.id
     FROM courses c
     JOIN course_sections cs ON cs.course_id = c.id
     WHERE c.id = $1 AND cs.id = $2 AND c.teacher_id = $3`,
    [courseId, sectionId, teacherId]
  );

  if (ownership.rows.length === 0) {
    throw new Error("Access denied: Invalid course or section");
  }

  const { rows } = await pool.query(
    `INSERT INTO course_files
      (course_id, section_id, file_name, stored_name, file_url, file_size, mime_type, uploaded_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [
      courseId,
      sectionId,
      file.originalname,
      file.filename,
      file.path,
      file.size,
      file.mimetype,
      teacherId
    ]
  );

  return rows[0];
};

export const getCourseFilesService = async (userId, role, courseId) => {
  await assertCourseAccess(userId, role, courseId);

  const { rows } = await pool.query(
    `SELECT *
     FROM course_files
     WHERE course_id = $1
     ORDER BY created_at DESC`,
    [courseId]
  );

  return rows;
};

export const downloadCourseFileService = async (userId, role, fileId) => {
  const { rows } = await pool.query(
    `SELECT cf.*
     FROM course_files cf
     WHERE cf.id = $1`,
    [fileId]
  );

  if (rows.length === 0) {
    throw new Error("File not found");
  }

  const file = rows[0];
  await assertCourseAccess(userId, role, file.course_id);

  if (role === "student") {
    await pool.query(
      `INSERT INTO file_downloads (user_id, file_id)
       VALUES ($1,$2)
       ON CONFLICT DO NOTHING`,
      [userId, fileId]
    );
  }

  return file;
};

// NEW FEATURE: allow teachers to delete their own course resource files.
export const deleteCourseFileService = async (teacherId, fileId) => {
  const { rows } = await pool.query(
    `SELECT cf.*
     FROM course_files cf
     JOIN courses c ON c.id = cf.course_id
     WHERE cf.id = $1
     AND c.teacher_id = $2`,
    [fileId, teacherId]
  );

  if (rows.length === 0) {
    throw new Error("File not found or access denied");
  }

  const file = rows[0];

  await pool.query("DELETE FROM course_files WHERE id = $1", [fileId]);

  if (file.file_url && fs.existsSync(file.file_url)) {
    fs.unlinkSync(file.file_url);
  }
};
