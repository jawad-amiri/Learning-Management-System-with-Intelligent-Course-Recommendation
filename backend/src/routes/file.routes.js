import express from "express";
import { upload } from "../config/multer.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import {
  uploadCourseFile,
  downloadCourseFile,
  getCourseFiles,
  deleteCourseFile
} from "../controllers/file.controller.js";

const router = express.Router();

router.get(
  "/course/:courseId",
  authMiddleware,
  getCourseFiles
);

router.post(
  "/:courseId/sections/:sectionId",
  authMiddleware,
  roleMiddleware("teacher"),
  upload.single("file"),
  uploadCourseFile
);

router.get(
  "/download/:fileId",
  authMiddleware,
  downloadCourseFile
);

// NEW FEATURE: teacher resource deletion for course management.
router.delete(
  "/:fileId",
  authMiddleware,
  roleMiddleware("teacher"),
  deleteCourseFile
);

export default router;
