import { updateProgressService, getMyProgressService } from "../services/progress.service.js";
import { sendResponse } from "../utils/response.js";
/**
 * Update progress for a student
 */
export const updateProgress = async (req, res, next) => {
    try {
        const { user_id, course_id, percent } = req.body;

        const result = await updateProgressService(user_id, course_id, percent);

        sendResponse(res, 200, "Progress updated successfully", result);
    } catch (error) {
        next(error);
    }
};


/**
 * Get progress of logged-in student
 */
export const getMyProgress = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const progress = await getMyProgressService(userId);

        sendResponse(res, 200, "Data fetched successfully", progress);
    } catch (error) {
        next(error)
    }
};