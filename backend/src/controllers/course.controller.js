import { sendResponse } from "../utils/response.js";
import {
    createCourseService,
    updateCourseService,
    getAllCoursesService,
    getCourseByIdService,
    getCourseDashboardService,
    deleteCourseService,
    replaceCourseThumbnailService,
    removeCourseThumbnailService
} from "../services/course.service.js";

/**
 * Create new course
 */
export const createCourse = async (req, res, next) => {
    try {
        const teacherId = req.user.id; // from JWT
        const courseData = req.body;

        const course = await createCourseService(courseData, teacherId, req.file);

        sendResponse(res, 201, "Course created Successfuly", course);
    } catch (error) {
        next(error);
    }
};

/**
 * Update course
 */
export const updateCourse = async (req, res, next) => {
    try {
        const courseId = req.params.id;
        const data = req.body;

        const course = await updateCourseService(courseId, data, req.file);

        if (!course) {
            sendResponse(res, 404, "Course not found");
        }

        sendResponse(res, 200, "Course updated successfully", course);
    } catch (error) {
        next(error)
    }
}

/**
 *  Get all courses
 */
export const getAllCourses = async (req, res, next) => {
    try {
        const courses = await getAllCoursesService(req.user.id, req.user.role);

        sendResponse(res, 200, "Courses fetched successfully", courses);
    } catch (error) {
        next(error);
    }
};

/**
 * Get Course by id
 */
export const getCourseById = async (req, res, next) => {
    try {
        const courseId = req.params.id;
        const course = await getCourseByIdService(courseId);

        if (!course) {
            return sendResponse(res, 404, "Course not found");
        }

        sendResponse(res, 200, "Course fetched successfully", course);
    } catch (error) {
        next(error);
    }
};

/**
 * Get course dashboard
 */
export const getCourseDashboard = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { courseId } = req.params;

        const dashboardData = await getCourseDashboardService(userId, courseId);

        sendResponse(res, 200, "Course dashboard fetched successfully", dashboardData);
    } catch (error) {
        next(error);
    }
};

/**
 * Delete course
 */
export const deleteCourse = async (req, res, next) => {
    try {
        const courseId = req.params.id;
        await deleteCourseService(courseId);

        sendResponse(res, 200, "course deleted successfully");
    } catch (error) {
        next(error);
    }
}

export const replaceCourseThumbnail = async (req, res, next) => {
    try {
        const course = await replaceCourseThumbnailService(
            req.params.id,
            req.user.id,
            req.user.role,
            req.file
        );

        if (!course) {
            return sendResponse(res, 404, "Course not found");
        }

        sendResponse(res, 200, "Course thumbnail updated successfully", course);
    } catch (error) {
        next(error);
    }
};

export const removeCourseThumbnail = async (req, res, next) => {
    try {
        const course = await removeCourseThumbnailService(
            req.params.id,
            req.user.id,
            req.user.role
        );

        if (!course) {
            return sendResponse(res, 404, "Course not found");
        }

        sendResponse(res, 200, "Course thumbnail removed successfully", course);
    } catch (error) {
        next(error);
    }
};
