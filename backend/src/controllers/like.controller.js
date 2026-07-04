import { sendResponse } from "../utils/response.js";
import {
    toggleCourseLikeService,
    getCourseLikesService,
} from "../services/like.service.js";

export const toggleCourseLike = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const courseId = req.params.courseId;

        const result = await toggleCourseLikeService(courseId, userId);

        sendResponse(res, 200, result.message, {liked: result.liked});
    } catch (error) {
        next(error);
    }
};

export const getCourseLikeInfo = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const courseId = req.params.courseId;   

        const likeInfo = await getCourseLikesService(courseId, userId);

        sendResponse(res, 200, "Course like info retrieved successfully", likeInfo);
    } catch (error) {
        next(error);
    }
};