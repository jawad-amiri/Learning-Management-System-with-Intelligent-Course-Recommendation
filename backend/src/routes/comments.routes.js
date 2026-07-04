import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import { 
    getCommentsByCourse,
    createComment,
    updateComment,
    toggleLike,
    showLikes,
    deleteComment
} from "../controllers/comments.controller.js"

const router = express.Router();

/**
 * GET /api/comment/:courseId
 * Get all comments for a course
 */
router.get(
    "/:courseId",
    authMiddleware,
    getCommentsByCourse
);

/**
 * POST /api/comment
 * create comments (student & teacher)
 */
router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin", "student", "teacher"),
    createComment
);

/**
 * PUT /api/comments/:id
 * edite own comment
 */
router.put(
    "/:id",
    authMiddleware,
    updateComment
)

/**
 * PUT /api/comments/like/id
 * like a comment
 */
router.put(
    "/like/:id",
    authMiddleware,
    toggleLike
);

router.get(
    "/showLikes/:id",
    authMiddleware,
    showLikes
)

/**
 * DELETE /api/comments/:id
 * Delete own comment
 */
router.delete(
    "/:id",
    authMiddleware,
    deleteComment
);

export default router;