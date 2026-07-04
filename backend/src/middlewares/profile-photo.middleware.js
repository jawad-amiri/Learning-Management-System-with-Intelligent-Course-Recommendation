// NEW - PROFILE PHOTO FEATURE: validates and stores user profile photos.
import fs from "fs";
import path from "path";
import multer from "multer";

const uploadRoot = path.resolve("uploads/users/profile-photos");

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

        cb(null, `${req.user.id}-${Date.now()}-${safeName}`);
    },
});

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

const fileFilter = (req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
        return cb(new Error("Profile photo must be a JPG, PNG, or WebP image"));
    }

    cb(null, true);
};

export const profilePhotoUpload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});
