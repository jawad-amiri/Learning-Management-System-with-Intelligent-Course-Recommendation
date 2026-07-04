import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMidddleware from "../middlewares/role.middleware.js";
import { getRecommendations } from "../controllers/recommendation.controller.js";

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    roleMidddleware("student"),
    getRecommendations,
);

export default router;