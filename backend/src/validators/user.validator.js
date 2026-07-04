import { body } from "express-validator";

// ===== PROFILE PHOTO FEATURE START =====
export const updateProfileValidator = [
    body("full_name").optional({ checkFalsy: true }).isLength({ min: 2 }).withMessage("Full name must be at least 2 characters"),
    body("username").optional({ checkFalsy: true }).isLength({ min: 3 }).withMessage("Username must be at least 3 characters"),
    body("email").optional({ checkFalsy: true }).isEmail().withMessage("Email must be valid"),
    body("bio").optional({ checkFalsy: true }).isLength({ max: 1000 }).withMessage("Bio must be 1000 characters or less"),
    body("expertise").optional({ checkFalsy: true }).isLength({ max: 255 }).withMessage("Expertise must be 255 characters or less"),
    body("experience").optional({ checkFalsy: true }).isLength({ max: 255 }).withMessage("Experience must be 255 characters or less"),
];

export const changePasswordValidator = [
    body("current_password").notEmpty().withMessage("Current password is required"),
    body("new_password").isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
    body("confirm_password").custom((value, { req }) => {
        if (value !== req.body.new_password) {
            throw new Error("Confirm password must match new password");
        }

        return true;
    }),
];
// ===== PROFILE PHOTO FEATURE END =====
