import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import {
  createSection,
  getCourseSections,
  updateSection,
  deleteSection
} from "../controllers/section.controller.js";

const router = express.Router();

router.get(
  "/:courseId/sections",
  authMiddleware,
  getCourseSections
);

router.post(
  "/:courseId/sections",
  authMiddleware,
  roleMiddleware("teacher"),
  createSection
);

router.put(
  "/sections/:sectionId",
  authMiddleware,
  roleMiddleware("teacher"),
  updateSection
);

router.delete(
  "/sections/:sectionId",
  authMiddleware,
  roleMiddleware("teacher"),
  deleteSection
);

export default router;