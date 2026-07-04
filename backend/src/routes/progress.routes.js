import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import { updateProgress, getMyProgress } from "../controllers/progress.controller.js";

const router = express.Router();

/**
 * PUT /api/progress
 * Teacher updates students progress
 */
router.put(
    "/",
    authMiddleware,
    roleMiddleware("teacher"),
    updateProgress
);

/**
 * GET /api/progress/my
 * Student views own progress
 */
router.get(
    "/my",
    authMiddleware,
    roleMiddleware("student"),
    getMyProgress
);

export default router;