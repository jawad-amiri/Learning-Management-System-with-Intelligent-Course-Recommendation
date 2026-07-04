import fs from "fs";
import { sendResponse } from "../utils/response.js";

import {
    createVideoService,
    uploadVideoService,
    getCourseVideosService,
    getCourseVideosWithStatusService,
    updateVideoProgressService,
    getVideoByIdService,
    deleteVideoService
} from "../services/video.service.js";

/**
 * Create URL video
 */
export const createVideo = async (req, res, next) => {
    try {
        const { courseId, sectionId } = req.params;
        const teacherId = req.user.id;

        const {
            title,
            description,
            video_url,
            thumbnail_url,
            // UPDATED FEATURE: duration may be omitted for URL videos when it cannot be detected.
            duration,
            position
        } = req.body;

        const video = await createVideoService(
            courseId,
            sectionId,
            teacherId,
            title,
            description,
            video_url,
            thumbnail_url,
            duration,
            position
        );

        sendResponse(res, 201, "Video created", video);
    } catch (err) {
        next(err);
    }
};

/**
 * Upload video
 */
export const uploadVideo = async (req, res, next) => {
    try {
        if (!req.file) {
            return sendResponse(res, 400, "No video file uploaded");
        }


        const { courseId, sectionId } = req.params;
        const teacherId = req.user.id;

        // UPDATED FEATURE: local upload duration is auto-detected by the frontend when available.
        const { title, description, duration, position } = req.body;

        const videoPath = req.file.path; // getting file path from multer

        const video = await uploadVideoService(
            courseId,
            sectionId,
            teacherId,
            title,
            description,
            videoPath,
            duration,
            position
        );

        sendResponse(res, 201, "Video uploaded", video);
    } catch (err) {
        next(err);
    }
};

/**
 * Stream video
 */
export const streamVideo = async (req, res, next) => {
    try {
        const { videoId } = req.params;

        const video = await getVideoByIdService(videoId);

        if (!video.video_path) {
            return sendResponse(res, 400, "Not a local video");
        }


        const filePath = video.video_path; // assuming video_path is the absolute path to the video file
        const stat = fs.statSync(filePath);


        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0]);
            const end = parts[1] ? parseInt(parts[1]) : fileSize - 1;

            const chunkSize = end - start + 1;

            const stream = fs.createReadStream(filePath, { start, end });

            res.writeHead(206, {
                "Content-Range": `bytes ${start}-${end}/${fileSize}`,
                "Accept-Ranges": "bytes",
                "Content-Length": chunkSize,
                "Content-Type": "video/mp4"
            });

            stream.pipe(res);
        } else {
            res.writeHead(200, {
                "Content-Length": fileSize,
                "Content-Type": "video/mp4"
            });

            fs.createReadStream(filePath).pipe(res);

        }

    } catch (err) {
        next(err);
    }
};

/**
 * Get videos
 */
export const getCourseVideos = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;
        const role = req.user.role;

        const videos = await getCourseVideosService(courseId, userId, role);

        sendResponse(res, 200, "Videos fetched", videos);
    } catch (err) {
        next(err);
    }
};

/**
 * Get videos with status
 */
export const getCourseVideosWithStatus = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;
        const role = req.user.role;

        const videos = await getCourseVideosWithStatusService(userId, courseId, role);

        sendResponse(res, 200, "Videos with status", videos);
    } catch (err) {
        next(err);
    }
};

/**
 * Update progress
 */
export const updateVideoProgress = async (req, res, next) => {
    try {
        const { videoId } = req.params;
        const userId = req.user.id;

        const { progress_seconds } = req.body;

        const result = await updateVideoProgressService(
            videoId,
            userId,
            progress_seconds
        );

        sendResponse(res, 200, "Progress updated", result);
    } catch (err) {
        next(err);
    }
};

/**
 * Delete
 */
export const deleteVideo = async (req, res, next) => {
    try {
        const { videoId } = req.params;
        const teacherId = req.user.id;

        await deleteVideoService(videoId, teacherId);

        sendResponse(res, 200, "Deleted");
    } catch (err) {
        next(err);
    }
};
