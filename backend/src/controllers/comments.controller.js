import { sendResponse } from "../utils/response.js";
import {
    getCommentsByCourseService,
    createCommentService,
    updateCommentService,
    toggleLikeService,
    showLikesService,
    deleteCommentService
} from "../services/comments.service.js";

/**
 * Get all comments for a course
 */
export const getCommentsByCourse = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;

        const allComments = await getCommentsByCourseService(courseId, userId);

        res.json(allComments);
    } catch (error) {
        next(error)
    }
};

/**
 * Create new comment
 */
export const createComment = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { course_id, comment } = req.body;

        if (!course_id || !comment) {
            return sendResponse( res, 400, "course id and comment are required");
        }

        const createdComment = await createCommentService(
            userId,
            course_id,
            comment
        );

        sendResponse(
            res,
            201,
            "Comment created successfully",
            { comment: createdComment }
        );
    } catch (error) {
        next(error)
    }
};

/**
 * update own comment
 */
export const updateComment = async (req, res, next) => {
    try {
        const commentId = req.params.id;
        const userId = req.user.id;
        const { comment } = req.body;

        await updateCommentService(comment, commentId, userId);

        sendResponse(res, 200, "Comment updated successfully");

    } catch (error) {
        next(error);
    }
};

/**
 *like a comment
 */
export const toggleLike = async (req, res, next) => {
    try {
        const commentId = req.params.id;
        const userId = req.user.id;

        const data = await toggleLikeService(commentId, userId);

        sendResponse(res, 200, data.message, {liked: data.liked});
    } catch (error) {
        next(error);
    }
}

/**
 * show all users who liked the comments
 */
export const showLikes = async (req, res, next) => {
    try {
        const commentId = req.params.id;
        const userId = req.user.id;

        const allLikes = await showLikesService(commentId, userId);

        sendResponse(res, 200, "All likes", allLikes)
    } catch (error) {
        next(error);
    }
}

export const deleteComment = async (req, res, next) => {
    try {
        const commentId = req.params.id;
        const userId = req.user.id;

        await deleteCommentService(commentId, userId);

        sendResponse(res, 200, "Comment deleted successfully")
    } catch (error) {
        next(error);
    }
};