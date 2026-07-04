import {
    completeEnrollmentStepService,
    enrollService,
    getEnrollmentStatusService,
    getMyEnrollmentsService,
    startEnrollmentService
} from "../services/enrollment.service.js";
import { sendResponse } from "../utils/response.js";

export const enrollInCourse = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { course_id } = req.body;

        await enrollService(userId, course_id);

        sendResponse(res, 201, "Enrolled successfully");
    } catch (error) {
        next(error);
    }
};

export const getEnrollmentStatus = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { courseId } = req.params;

        const status = await getEnrollmentStatusService(userId, courseId);

        sendResponse(res, 200, "Enrollment status fetched successfully", status);
    } catch (error) {
        next(error);
    }
};

export const startEnrollment = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { courseId } = req.params;

        const enrollment = await startEnrollmentService(userId, courseId);

        sendResponse(res, 200, "Enrollment started", enrollment);
    } catch (error) {
        next(error);
    }
};

export const completeEnrollmentStep = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { courseId } = req.params;

        const enrollment = await completeEnrollmentStepService(userId, courseId, req.body);

        sendResponse(res, 200, "Enrollment step completed", enrollment);
    } catch (error) {
        next(error);
    }
};

export const getMyEnrollments = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const enrollments = await getMyEnrollmentsService(userId);

        sendResponse(res, 200, "Data fetched successfully", enrollments);
    } catch (error) {
        next(error);
    }
};
