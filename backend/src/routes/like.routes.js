import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
    toggleCourseLike,
    getCourseLikeInfo
} from "../controllers/like.controller.js";

const router = express.Router();

/**
 * PUT /api/like/course/:courseId
 * like or unlike a course
 */
router.put(
    "/courses/:courseId",
    authMiddleware,
    toggleCourseLike
);

/**
 * GET /api/like/course/:courseId
 * get like info for a course (total likes and if the current user liked it)
 */
router.get(
    "/courses/:courseId",
    authMiddleware,
    getCourseLikeInfo
);

export default router;