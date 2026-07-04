import express from "express";
import { validationResult } from "express-validator";
import authMiddleware from "../middlewares/auth.middleware.js";
import { profilePhotoUpload } from "../middlewares/profile-photo.middleware.js";
import {
    changeCurrentUserPassword,
    getCurrentUserProfile,
    getPublicTeacherProfile,
    removeCurrentUserProfilePhoto,
    updateCurrentUserProfile,
} from "../controllers/user.controller.js";
import {
    changePasswordValidator,
    updateProfileValidator,
} from "../validators/user.validator.js";

const router = express.Router();

const handleValidation = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array(),
        });
    }

    next();
};

// ===== PROFILE PHOTO FEATURE START =====
router.get("/me", authMiddleware, getCurrentUserProfile);

router.put(
    "/me",
    authMiddleware,
    profilePhotoUpload.single("profile_photo"),
    updateProfileValidator,
    handleValidation,
    updateCurrentUserProfile
);

router.delete(
    "/me/photo",
    authMiddleware,
    removeCurrentUserProfilePhoto
);

router.put(
    "/me/password",
    authMiddleware,
    changePasswordValidator,
    handleValidation,
    changeCurrentUserPassword
);

router.get(
    "/teachers/:id",
    authMiddleware,
    getPublicTeacherProfile
);
// ===== PROFILE PHOTO FEATURE END =====

export default router;
