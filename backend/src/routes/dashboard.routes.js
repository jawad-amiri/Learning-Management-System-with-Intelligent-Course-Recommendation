import authMiddlware from "../middlewares/auth.middleware.js";
import {
    getDashboardData
} from "../controllers/dashboard.controller.js";
import express from "express";

const router = express.Router();

/**
 * Get /api/dashboard
 * Return role-based dashboard data
 */
router.get(
    "/",
    authMiddlware,
    getDashboardData
);

export default router;