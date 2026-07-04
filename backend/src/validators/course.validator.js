import { body } from "express-validator";

export const createCourseValidator = [
    body('title').not().isEmpty().withMessage("Course title is required"),

    body("description").notEmpty().withMessage("Description is required"),

    body("category").not().isEmpty().withMessage("Course category is required"),

    body("level").isIn(["Beginner", "Intermediate", "Advanced"]).withMessage("Invalid course level"),
];

export const updateCourseValidator = [
    body("title").optional().not().isEmpty().withMessage("Course title connot be empty"),

    body("description").notEmpty().withMessage("Description cannot be empty"),

    body("category").optional().not().isEmpty().withMessage("Course category connot be empty"),

    body("level").optional().isIn(["Beginner", "Intermediate", "Advanced"]).withMessage("Invalid course level"),
];
