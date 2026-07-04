import express from "express";
import { validationResult } from "express-validator";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import {
    completeEnrollmentStep,
    enrollInCourse,
    getEnrollmentStatus,
    getMyEnrollments,
    startEnrollment
} from "../controllers/enrollment.controller.js";
import { completeEnrollmentStepValidator } from "../validators/enrollment.validator.js";

const router = express.Router();

// NEW FEATURE: enrollment validation handler follows the same route-level pattern as auth/courses.
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    next();
};

/**
 * POST api/enrollments
 * student only
 */
router.post(
    "/",
    authMiddleware,
    roleMiddleware("student"),
    enrollInCourse
);

router.get(
    "/course/:courseId/status",
    authMiddleware,
    roleMiddleware("student"),
    getEnrollmentStatus
);

router.post(
    "/course/:courseId/start",
    authMiddleware,
    roleMiddleware("student"),
    startEnrollment
);

router.patch(
    "/course/:courseId/steps",
    authMiddleware,
    roleMiddleware("student"),
    completeEnrollmentStepValidator,
    handleValidation,
    completeEnrollmentStep
);

/**
 * GET /api/enrollments/my
 * student only
 */
router.get(
    "/my",
    authMiddleware,
    roleMiddleware("student"),
    getMyEnrollments
);

export default router;
