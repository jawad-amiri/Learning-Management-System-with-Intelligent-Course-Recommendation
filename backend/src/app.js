import express from 'express';
import path from 'path';
import cors from "cors";
import errorMiddleware from './middlewares/error.middleware.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import dashboardRoutes from "./routes/dashboard.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import enrollmentRoutes from "./routes/enrollment.routes.js";
import courseRoutes from './routes/course.routes.js';
import videoRoutes from "./routes/video.routes.js";
import fileRoutes from "./routes/file.routes.js";
import progressRoutes from "./routes/progress.routes.js";
import certificateRoutes from "./routes/certificate.routes.js";
import recommendationRoutes from "./routes/recommendation.routes.js";
import commentRoutes from "./routes/comments.routes.js";
import likeRoutes from "./routes/like.routes.js";
import sectionRoutes from "./routes/section.routes.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.resolve("uploads")));

app.use("/api/auth", authRoutes);
// ===== PROFILE PHOTO FEATURE START =====
app.use("/api/users", userRoutes);
// ===== PROFILE PHOTO FEATURE END =====
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/certificates", certificateRoutes)
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/like", likeRoutes);
app.use("/api/sections", sectionRoutes);

app.use(errorMiddleware);

export default app;
