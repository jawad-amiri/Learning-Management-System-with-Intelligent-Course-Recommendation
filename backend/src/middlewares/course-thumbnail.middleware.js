import fs from "fs";
import path from "path";
import multer from "multer";

const uploadRoot = path.resolve("uploads/courses/thumbnails");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        fs.mkdirSync(uploadRoot, { recursive: true });
        cb(null, uploadRoot);
    },
    filename: (req, file, cb) => {
        const safeName = file.originalname
            .toLowerCase()
            .replace(/[^a-z0-9.]+/g, "-")
            .replace(/^-+|-+$/g, "");

        cb(null, `${Date.now()}-${safeName}`);
    },
});

const allowedMimeTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
]);

const fileFilter = (req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
        return cb(new Error("Course thumbnail must be a JPG, PNG, WebP, or GIF image"));
    }

    cb(null, true);
};

export const courseThumbnailUpload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});
