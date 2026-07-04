import pool from "../config/db.js";

// RECOMMENDATION AI IMPROVEMENT: levels are ordered so the rule engine can reason about next steps.
const LEVEL_ORDER = ["Beginner", "Intermediate", "Advanced"];

const normalize = (value) => String(value ?? "").trim().toLowerCase();

const splitKeywords = (value) =>
    String(value ?? "")
        .split(/[,،\n]/)
        .map((item) => normalize(item))
        .filter(Boolean);

const nextLevelAfter = (level) => {
    const index = LEVEL_ORDER.findIndex((item) => normalize(item) === normalize(level));
    return index >= 0 ? LEVEL_ORDER[Math.min(index + 1, LEVEL_ORDER.length - 1)] : "Beginner";
};

const addRule = (rules, points, reason) => {
    if (points > 0) {
        rules.push({ points, reason });
    }
};

// RECOMMENDATION AI IMPROVEMENT: collect profile, enrollment intake, progress, and completed course data.
const getLearnerContext = async (userId) => {
    const [{ rows: intakeRows }, { rows: enrolledRows }, { rows: progressRows }] = await Promise.all([
        pool.query(
            `SELECT
                learning_goal,
                interest_topics,
                experience_level,
                learning_motivation,
                preferred_difficulty,
                study_time_per_week,
                e.status,
                c.category,
                c.level,
                COALESCE(p.progress_percent, 0) AS progress_percent
             FROM enrollments e
             JOIN courses c ON c.id = e.course_id
             LEFT JOIN progress p ON p.user_id = e.user_id AND p.course_id = e.course_id
             WHERE e.user_id = $1
             ORDER BY e.activated_at DESC NULLS LAST, e.enrolled_at DESC NULLS LAST`,
            [userId]
        ),
        pool.query(
            `SELECT course_id, status
             FROM enrollments
             WHERE user_id = $1`,
            [userId]
        ),
        pool.query(
            `SELECT course_id, progress_percent
             FROM progress
             WHERE user_id = $1`,
            [userId]
        )
    ]);

    const activeIntake = intakeRows.find((row) => row.status !== "pending") ?? intakeRows[0] ?? {};
    const completedRows = progressRows.filter((row) => Number(row.progress_percent) >= 100);
    const strongProgressRows = intakeRows.filter((row) => Number(row.progress_percent) >= 70);

    return {
        learningGoal: normalize(activeIntake.learning_goal),
        motivation: normalize(activeIntake.learning_motivation),
        interests: splitKeywords(activeIntake.interest_topics),
        experienceLevel: activeIntake.experience_level || null,
        preferredDifficulty: activeIntake.preferred_difficulty || null,
        studyTime: activeIntake.study_time_per_week || null,
        categories: [...new Set(intakeRows.map((row) => row.category).filter(Boolean))],
        completedCourseIds: completedRows.map((row) => Number(row.course_id)),
        enrolledCourseIds: enrolledRows.map((row) => Number(row.course_id)),
        strongProgressCategories: [...new Set(strongProgressRows.map((row) => row.category).filter(Boolean))],
        nextLevels: [...new Set(strongProgressRows.map((row) => nextLevelAfter(row.level)))]
    };
};

const getCandidateCourses = async (userId) => {
    const { rows } = await pool.query(
        `SELECT
            c.id,
            c.title,
            c.description,
            c.category,
            c.level,
            c.thumbnail_url,
            c.image_url,
            c.teacher_id,
            u.full_name AS teacher_name,
            u.profile_photo_url AS teacher_profile_photo_url,
            c.prerequisite_course_id,
            prereq.title AS prerequisite_title
         FROM courses c
         JOIN users u ON u.id = c.teacher_id
         LEFT JOIN courses prereq ON prereq.id = c.prerequisite_course_id
         WHERE c.status = 'active'
         AND NOT EXISTS (
            SELECT 1
            FROM enrollments e
            WHERE e.user_id = $1
            AND e.course_id = c.id
            AND e.status = 'active'
         )
         ORDER BY c.created_at DESC`,
        [userId]
    );

    return rows;
};

// RECOMMENDATION AI IMPROVEMENT: each course receives explainable rule points.
const scoreCourse = (course, context) => {
    const rules = [];
    const courseText = normalize(`${course.title} ${course.description} ${course.category} ${course.level}`);
    const courseLevel = course.level || "Beginner";

    // Beginner users should see approachable courses first.
    if (!context.experienceLevel && courseLevel === "Beginner") {
        addRule(rules, 18, "Good starting point for a new learner.");
    }

    if (context.experienceLevel && normalize(courseLevel) === normalize(context.experienceLevel)) {
        addRule(rules, 24, `Matches your current experience level: ${context.experienceLevel}.`);
    }

    if (context.preferredDifficulty && normalize(courseLevel) === normalize(context.preferredDifficulty)) {
        addRule(rules, 22, `Matches your preferred difficulty: ${context.preferredDifficulty}.`);
    }

    // After strong progress, encourage the next logical level.
    if (context.nextLevels.some((level) => normalize(level) === normalize(courseLevel))) {
        addRule(rules, 28, "Next logical difficulty after your recent progress.");
    }

    // Interests and goals make the recommendation personally relevant.
    const interestHits = context.interests.filter((interest) => courseText.includes(interest));
    if (interestHits.length > 0) {
        addRule(rules, Math.min(30, interestHits.length * 12), `Related to your interests: ${interestHits.join(", ")}.`);
    }

    if (context.learningGoal && courseText.includes(context.learningGoal.split(" ")[0])) {
        addRule(rules, 10, "Shares keywords with your learning goal.");
    }

    if (context.motivation && courseText.includes(context.motivation.split(" ")[0])) {
        addRule(rules, 8, "Connects with your stated learning motivation.");
    }

    // Familiar categories help learners continue a path; a smaller bonus keeps room for discovery.
    if (context.categories.some((category) => normalize(category) === normalize(course.category))) {
        addRule(rules, 18, `Continues your learning path in ${course.category}.`);
    }

    if (context.strongProgressCategories.some((category) => normalize(category) === normalize(course.category))) {
        addRule(rules, 16, "Builds on a category where you already made strong progress.");
    }

    if (!course.prerequisite_course_id || context.completedCourseIds.includes(Number(course.prerequisite_course_id))) {
        addRule(rules, 10, "You meet the prerequisite requirements.");
    }

    // Give small discovery value to courses outside the current category loop.
    if (context.categories.length > 0 && !context.categories.some((category) => normalize(category) === normalize(course.category))) {
        addRule(rules, 6, "Adds a fresh topic without leaving the LMS learning path.");
    }

    const score = rules.reduce((total, rule) => total + rule.points, 0);

    return {
        ...course,
        recommendation_score: score,
        recommendation_reasons: rules
            .sort((a, b) => b.points - a.points)
            .slice(0, 3)
            .map((rule) => rule.reason)
    };
};

export const recommendationService = async (userId) => {
    const context = await getLearnerContext(userId);
    const candidates = await getCandidateCourses(userId);

    return candidates
        .filter((course) => !context.completedCourseIds.includes(Number(course.id)))
        .map((course) => scoreCourse(course, context))
        .filter((course) => Number(course.recommendation_score) > 0)
        .sort((a, b) => Number(b.recommendation_score) - Number(a.recommendation_score))
        .slice(0, 12);
};
