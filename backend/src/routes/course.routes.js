import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import {
    createCourse,
    updateCourse,
    getAllCourses,
    getCourseById,
    getCourseDashboard,
    deleteCourse,
    replaceCourseThumbnail,
    removeCourseThumbnail
} from "../controllers/course.controller.js";
import {
    createCourseValidator,
    updateCourseValidator
} from "../validators/course.validator.js";
import { validationResult } from 'express-validator';
import { courseThumbnailUpload } from '../middlewares/course-thumbnail.middleware.js';

const router = express.Router();

// MiddleWare for handling validation errors
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res
            .status(400)
            .json({
                success: false,
                errors: errors.array()
            });
    }

    next();
}

/** 
* GET /api/courses
* student + teacher
*/
router.get(
    '/',
    authMiddleware,
    roleMiddleware('super_admin',"admin",'student', 'teacher'),
    getAllCourses
);

/** 
* GET /api/courses/:id
* student + teacher
*/
router.get(
    '/:id',
    authMiddleware,
    roleMiddleware('super_admin',  'admin', 'student', 'teacher'),
    getCourseById
);

/**
 * GET /api/courses/:id/dashboard
 * student only
 */
router.get(
    "/:courseId/dashboard",
    authMiddleware,
    roleMiddleware("student"),
    getCourseDashboard  
);

/**
 * POST api/courses
 * (teacher + admin) only
 */
router.post(
    '/',
    authMiddleware,
    roleMiddleware('admin','teacher'),
    courseThumbnailUpload.single("thumbnail"),
    createCourseValidator,
    handleValidation,
    createCourse
);

/**
 * PUT /api/courses/:id
 * (teacher + admin) only
 */
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("admin", "teacher"),
    courseThumbnailUpload.single("thumbnail"),
    updateCourseValidator,
    handleValidation,
    updateCourse
);

/**
 * POST /api/courses/:id/thumbnail
 * teacher/admin replace thumbnail image
 */
router.post(
    "/:id/thumbnail",
    authMiddleware,
    roleMiddleware("admin", "teacher"),
    courseThumbnailUpload.single("thumbnail"),
    replaceCourseThumbnail
);

/**
 * DELETE /api/courses/:id/thumbnail
 * teacher/admin remove thumbnail image
 */
router.delete(
    "/:id/thumbnail",
    authMiddleware,
    roleMiddleware("admin", "teacher"),
    removeCourseThumbnail
);

/**
 * DELETE /api/courses/:id
 * admin only
 */
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    deleteCourse
);

export default router;
