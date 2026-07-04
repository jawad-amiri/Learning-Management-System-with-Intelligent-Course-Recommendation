import { sendResponse } from "../utils/response.js";
import {
    changeCurrentUserPasswordService,
    getCurrentUserProfileService,
    getPublicTeacherProfileService,
    removeCurrentUserProfilePhotoService,
    updateCurrentUserProfileService,
} from "../services/user.service.js";

// ===== PROFILE PHOTO FEATURE START =====
export const getCurrentUserProfile = async (req, res, next) => {
    try {
        const profile = await getCurrentUserProfileService(req.user.id);
        sendResponse(res, 200, "Profile fetched successfully", profile);
    } catch (error) {
        next(error);
    }
};

export const updateCurrentUserProfile = async (req, res, next) => {
    try {
        const profile = await updateCurrentUserProfileService(req.user.id, req.body, req.file);
        sendResponse(res, 200, "Profile updated successfully", profile);
    } catch (error) {
        next(error);
    }
};

export const removeCurrentUserProfilePhoto = async (req, res, next) => {
    try {
        const profile = await removeCurrentUserProfilePhotoService(req.user.id);
        sendResponse(res, 200, "Profile photo removed successfully", profile);
    } catch (error) {
        next(error);
    }
};

export const changeCurrentUserPassword = async (req, res, next) => {
    try {
        await changeCurrentUserPasswordService(req.user.id, req.body);
        sendResponse(res, 200, "Password changed successfully");
    } catch (error) {
        next(error);
    }
};

export const getPublicTeacherProfile = async (req, res, next) => {
    try {
        const profile = await getPublicTeacherProfileService(req.params.id);
        sendResponse(res, 200, "Teacher profile fetched successfully", profile);
    } catch (error) {
        next(error);
    }
};
// ===== PROFILE PHOTO FEATURE END =====
