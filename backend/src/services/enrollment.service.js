import pool from "../config/db.js";

// NEW FEATURE: learner intake fields captured during enrollment and reused by recommendations.
const cleanText = (value, maxLength = 500) => {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    return trimmed.slice(0, maxLength);
};

// NEW FEATURE: keep learner preferences constrained to values the UI and rule engine understand.
const normalizeChoice = (value, allowed, fallback = null) => {
    if (typeof value !== "string") return fallback;
    const match = allowed.find((item) => item.toLowerCase() === value.trim().toLowerCase());
    return match ?? fallback;
};

// NEW FEATURE: parse a short comma/list based interest field without creating a separate table.
const normalizeInterests = (value) => {
    if (Array.isArray(value)) {
        return value.map((item) => cleanText(String(item), 60)).filter(Boolean).slice(0, 8).join(", ");
    }

    return cleanText(value, 240);
};

const enrollmentSteps = [
    {
        id: "requirements",
        title: "Review requirements",
        description: "Confirm the course is active and any prerequisite is completed."
    },
    {
        id: "learning_goal",
        title: "Personalize learning",
        description: "Share your goal, interests, experience, and weekly study time."
    },
    {
        id: "agreement",
        title: "Confirm enrollment",
        description: "Accept the course commitment and unlock course materials."
    }
];

const getNextStep = (currentStep) => {
    if (currentStep === "requirements") return "learning_goal";
    if (currentStep === "learning_goal") return "agreement";
    return "completed";
};

const getEnrollmentStatus = async (userId, courseId) => {
    const { rows } = await pool.query(
        `SELECT
            id,
            status,
            current_step,
            learning_goal,
            interest_topics,
            experience_level,
            learning_motivation,
            preferred_difficulty,
            study_time_per_week,
            accepted_terms,
            enrolled_at,
            activated_at
         FROM enrollments
         WHERE user_id = $1 AND course_id = $2`,
        [userId, courseId]
    );

    return rows[0] ?? null;
};

export const getEnrollmentStatusService = async (userId, courseId) => {
    if (!courseId) {
        throw new Error("Course ID is required");
    }

    const { rows: courseRows } = await pool.query(
        `SELECT
            c.id,
            c.title,
            c.status,
            c.prerequisite_course_id,
            prereq.title AS prerequisite_title,
            COALESCE(prereq_progress.progress_percent, 0) AS prerequisite_progress
         FROM courses c
         LEFT JOIN courses prereq ON prereq.id = c.prerequisite_course_id
         LEFT JOIN progress prereq_progress
            ON prereq_progress.course_id = c.prerequisite_course_id
            AND prereq_progress.user_id = $1
         WHERE c.id = $2`,
        [userId, courseId]
    );

    if (courseRows.length === 0) {
        throw new Error("Course not found");
    }

    const course = courseRows[0];
    const prerequisiteMet =
        !course.prerequisite_course_id || Number(course.prerequisite_progress) >= 100;
    const enrollment = await getEnrollmentStatus(userId, courseId);

    return {
        course,
        enrollment,
        steps: enrollmentSteps,
        canStart: course.status === "active" && prerequisiteMet,
        prerequisiteMet
    };
};

export const startEnrollmentService = async (userId, courseId) => {
    const status = await getEnrollmentStatusService(userId, courseId);

    if (!status.canStart) {
        throw new Error("Course requirements are not complete");
    }

    if (status.enrollment?.status === "active") {
        return status.enrollment;
    }

    const { rows } = await pool.query(
        `INSERT INTO enrollments (user_id, course_id, status, current_step, accepted_terms)
         VALUES ($1, $2, 'pending', 'requirements', false)
         ON CONFLICT (user_id, course_id)
         DO UPDATE SET
            status = CASE
                WHEN enrollments.status = 'active' THEN enrollments.status
                ELSE 'pending'
            END,
            current_step = CASE
                WHEN enrollments.status = 'active' THEN enrollments.current_step
                ELSE COALESCE(enrollments.current_step, 'requirements')
            END
         RETURNING
            id,
            status,
            current_step,
            learning_goal,
            interest_topics,
            experience_level,
            learning_motivation,
            preferred_difficulty,
            study_time_per_week,
            accepted_terms,
            enrolled_at,
            activated_at`,
        [userId, courseId]
    );

    return rows[0];
};

export const completeEnrollmentStepService = async (userId, courseId, payload) => {
    const {
        step,
        learning_goal,
        interest_topics,
        experience_level,
        learning_motivation,
        preferred_difficulty,
        study_time_per_week,
        accepted_terms
    } = payload;

    if (!step || !enrollmentSteps.some((item) => item.id === step)) {
        throw new Error("Invalid enrollment step");
    }

    const enrollment = await startEnrollmentService(userId, courseId);

    if (enrollment.status === "active") {
        return enrollment;
    }

    if (enrollment.current_step !== step) {
        throw new Error(`Complete ${enrollment.current_step} first`);
    }

    const normalizedGoal = cleanText(learning_goal, 500);
    const normalizedInterests = normalizeInterests(interest_topics);
    const normalizedExperience = normalizeChoice(experience_level, ["Beginner", "Intermediate", "Advanced"]);
    const normalizedMotivation = cleanText(learning_motivation, 260);
    const normalizedDifficulty = normalizeChoice(preferred_difficulty, ["Beginner", "Intermediate", "Advanced"]);
    const normalizedStudyTime = normalizeChoice(study_time_per_week, ["1-3 hours", "4-6 hours", "7-10 hours", "10+ hours"]);

    // NEW FEATURE: require only useful personalization data, keeping enrollment short.
    if (step === "learning_goal" && !normalizedGoal) {
        throw new Error("Learning goal is required");
    }

    if (step === "learning_goal" && !normalizedExperience) {
        throw new Error("Experience level is required");
    }

    if (step === "learning_goal" && !normalizedDifficulty) {
        throw new Error("Preferred difficulty is required");
    }

    if (step === "agreement" && accepted_terms !== true) {
        throw new Error("You must accept the enrollment agreement");
    }

    const nextStep = getNextStep(step);
    const isActive = nextStep === "completed";

    const { rows } = await pool.query(
        `UPDATE enrollments
         SET current_step = $1,
             status = CASE WHEN $2 THEN 'active' ELSE status END,
             learning_goal = COALESCE($3, learning_goal),
             interest_topics = COALESCE($4, interest_topics),
             experience_level = COALESCE($5, experience_level),
             learning_motivation = COALESCE($6, learning_motivation),
             preferred_difficulty = COALESCE($7, preferred_difficulty),
             study_time_per_week = COALESCE($8, study_time_per_week),
             accepted_terms = CASE WHEN $9 THEN true ELSE accepted_terms END,
             enrolled_at = CASE WHEN $2 THEN CURRENT_TIMESTAMP ELSE enrolled_at END,
             activated_at = CASE WHEN $2 THEN CURRENT_TIMESTAMP ELSE activated_at END
         WHERE user_id = $10 AND course_id = $11
         RETURNING
            id,
            status,
            current_step,
            learning_goal,
            interest_topics,
            experience_level,
            learning_motivation,
            preferred_difficulty,
            study_time_per_week,
            accepted_terms,
            enrolled_at,
            activated_at`,
        [
            nextStep,
            isActive,
            normalizedGoal,
            normalizedInterests,
            normalizedExperience,
            normalizedMotivation,
            normalizedDifficulty,
            normalizedStudyTime,
            accepted_terms === true,
            userId,
            courseId
        ]
    );

    if (isActive) {
        await pool.query(
            `INSERT INTO progress (user_id, course_id, progress_percent, manual_percent)
             VALUES ($1, $2, 0, 0)
             ON CONFLICT (user_id, course_id) DO NOTHING`,
            [userId, courseId]
        );
    }

    return rows[0];
};

export const enrollService = async (userId, courseId) => {
    const enrollment = await startEnrollmentService(userId, courseId);

    if (enrollment.status !== "active") {
        throw new Error("Enrollment requires review, goal, and agreement steps");
    }

    return enrollment;
};

export const getMyEnrollmentsService = async (userId) => {
    const query = `
    SELECT
      c.id,
      c.title,
      c.category,
      c."level",
      c.thumbnail_url,
      e.enrolled_at
    FROM enrollments e
    JOIN courses c ON e.course_id = c.id
    WHERE e.user_id = $1
    AND e.status = 'active'
    ORDER BY e.enrolled_at DESC
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
}
