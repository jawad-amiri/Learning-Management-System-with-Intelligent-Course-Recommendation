import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import upload from "../middlewares/upload.middleware.js";

import {
  createVideo,
  uploadVideo,
  streamVideo,
  getCourseVideos,
  getCourseVideosWithStatus,
  updateVideoProgress,
  deleteVideo
} from "../controllers/video.controller.js";

const router = express.Router();

/**
 * Create video (URL - YouTusbe)
 */
router.post(
  "/:courseId/:sectionId/url",
  authMiddleware,
  roleMiddleware("teacher"),
  createVideo
);

/**
 * Upload video (LOCAL)
 */
router.post(
  "/:courseId/:sectionId/upload",
  authMiddleware,
  roleMiddleware("teacher"),
  upload.single("video"),
  uploadVideo
);

/**
 * Stream video (LOCAL)
 */
router.get(
  "/stream/:videoId",
  authMiddleware,
  streamVideo
);

/**
 * Get all videos
 */
router.get(
  "/:courseId",
  authMiddleware,
  getCourseVideos
);

/**
 * Get videos with progress
 */
router.get(
  "/course/:courseId",
  authMiddleware,
  roleMiddleware("student"),
  getCourseVideosWithStatus
);

/**
 * Update progress (IMPORTANT)
 */
router.post(
  "/:videoId/progress",
  authMiddleware,
  roleMiddleware("student"),
  updateVideoProgress
);

/**
 * Delete video
 */
router.delete(
  "/:videoId",
  authMiddleware,
  roleMiddleware("teacher"),
  deleteVideo
);

export default router;