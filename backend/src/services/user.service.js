import pool from "../config/db.js";
import fs from "fs/promises";
import path from "path";
import { comparePassword, hashPassword } from "../utils/password.js";

// ===== PROFILE PHOTO FEATURE START =====
const publicUploadUrl = (file) => {
    if (!file?.path) return null;

    const normalized = file.path.replace(/\\/g, "/");
    const marker = "/uploads/";
    const markerIndex = normalized.lastIndexOf(marker);

    if (markerIndex >= 0) {
        return normalized.slice(markerIndex);
    }

    return `/uploads/users/profile-photos/${file.filename}`;
};

const deleteLocalProfilePhoto = async (profilePhotoUrl) => {
    if (!profilePhotoUrl || !profilePhotoUrl.startsWith("/uploads/")) return;

    const localPath = path.resolve(profilePhotoUrl.replace(/^\/+/, ""));

    try {
        await fs.unlink(localPath);
    } catch (error) {
        if (error.code !== "ENOENT") {
            throw error;
        }
    }
};

const profileSelect = `
    SELECT
        u.id,
        u.full_name,
        u.username,
        u.email,
        u.profile_photo_url,
        u.bio,
        u.expertise,
        u.experience,
        u.created_at,
        r.role_name AS role
    FROM users u
    JOIN roles r ON u.role_id = r.id
`;

const addProfileCompletion = (user) => {
    if (!user) return user;

    const fields = [
        user.profile_photo_url,
        user.full_name,
        user.username,
        user.email,
        user.bio,
        user.role === "teacher" ? user.expertise : true,
        user.role === "teacher" ? user.experience : true,
    ];

    return {
        ...user,
        profile_completion: Math.round((fields.filter(Boolean).length / fields.length) * 100),
    };
};

export const getCurrentUserProfileService = async (userId) => {
    const { rows } = await pool.query(
        `${profileSelect} WHERE u.id = $1`,
        [userId]
    );

    if (rows.length === 0) {
        throw new Error("User not found");
    }

    return addProfileCompletion(rows[0]);
};

export const updateCurrentUserProfileService = async (userId, data, profilePhotoFile = null) => {
    const currentResult = await pool.query(
        "SELECT id, email, username, profile_photo_url FROM users WHERE id = $1",
        [userId]
    );
    const current = currentResult.rows[0];

    if (!current) {
        throw new Error("User not found");
    }

    if (data.email && data.email !== current.email) {
        const emailCheck = await pool.query(
            "SELECT id FROM users WHERE email = $1 AND id != $2",
            [data.email, userId]
        );

        if (emailCheck.rows.length > 0) {
            throw new Error("Email already exists");
        }
    }

    if (data.username && data.username !== current.username) {
        const usernameCheck = await pool.query(
            "SELECT id FROM users WHERE username = $1 AND id != $2",
            [data.username, userId]
        );

        if (usernameCheck.rows.length > 0) {
            throw new Error("Username already exists");
        }
    }

    const profilePhotoUrl = publicUploadUrl(profilePhotoFile);

    await pool.query(
        `
        UPDATE users
        SET full_name = COALESCE($1, full_name),
            username = COALESCE($2, username),
            email = COALESCE($3, email),
            bio = COALESCE($4, bio),
            expertise = COALESCE($5, expertise),
            experience = COALESCE($6, experience),
            profile_photo_url = COALESCE($7, profile_photo_url),
            updated_at = NOW()
        WHERE id = $8
        `,
        [
            data.full_name?.trim() || null,
            data.username?.trim() || null,
            data.email?.trim() || null,
            data.bio?.trim() || null,
            data.expertise?.trim() || null,
            data.experience?.trim() || null,
            profilePhotoUrl,
            userId,
        ]
    );

    if (profilePhotoUrl && current.profile_photo_url !== profilePhotoUrl) {
        await deleteLocalProfilePhoto(current.profile_photo_url);
    }

    return getCurrentUserProfileService(userId);
};

export const removeCurrentUserProfilePhotoService = async (userId) => {
    const currentResult = await pool.query(
        "SELECT profile_photo_url FROM users WHERE id = $1",
        [userId]
    );
    const current = currentResult.rows[0];

    if (!current) {
        throw new Error("User not found");
    }

    await pool.query(
        "UPDATE users SET profile_photo_url = NULL, updated_at = NOW() WHERE id = $1",
        [userId]
    );
    await deleteLocalProfilePhoto(current.profile_photo_url);

    return getCurrentUserProfileService(userId);
};

export const changeCurrentUserPasswordService = async (userId, { current_password, new_password }) => {
    const { rows } = await pool.query(
        "SELECT password FROM users WHERE id = $1",
        [userId]
    );

    if (rows.length === 0) {
        throw new Error("User not found");
    }

    const isMatch = await comparePassword(current_password, rows[0].password);
    if (!isMatch) {
        throw new Error("Current password is incorrect");
    }

    const hashedPassword = await hashPassword(new_password);
    await pool.query(
        "UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2",
        [hashedPassword, userId]
    );

    return true;
};

export const getPublicTeacherProfileService = async (teacherId) => {
    const { rows } = await pool.query(
        `
        SELECT
            u.id,
            u.full_name,
            u.username,
            u.profile_photo_url,
            u.bio,
            u.expertise,
            u.experience,
            u.created_at,
            COUNT(DISTINCT c.id) AS total_courses,
            COUNT(DISTINCT e.user_id) AS total_students,
            COUNT(DISTINCT cert.id) AS certificates_issued
        FROM users u
        JOIN roles r ON u.role_id = r.id
        LEFT JOIN courses c ON c.teacher_id = u.id
        LEFT JOIN enrollments e ON e.course_id = c.id AND e.status = 'active'
        LEFT JOIN certificates cert ON cert.course_id = c.id AND cert.status = 'approved'
        WHERE u.id = $1
        AND r.role_name = 'teacher'
        GROUP BY u.id
        `,
        [teacherId]
    );

    if (rows.length === 0) {
        throw new Error("Teacher not found");
    }

    const coursesResult = await pool.query(
        `
        SELECT id, title, description, category, "level", thumbnail_url, status, created_at
        FROM courses
        WHERE teacher_id = $1
        AND status = 'active'
        ORDER BY created_at DESC
        `,
        [teacherId]
    );

    return {
        ...rows[0],
        courses: coursesResult.rows,
    };
};
// ===== PROFILE PHOTO FEATURE END =====
