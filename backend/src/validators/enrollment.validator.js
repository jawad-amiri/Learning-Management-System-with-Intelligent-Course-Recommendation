import { body } from "express-validator";

// NEW FEATURE: validates the richer learner-intake enrollment payload.
export const completeEnrollmentStepValidator = [
    body("step")
        .isIn(["requirements", "learning_goal", "agreement"])
        .withMessage("Invalid enrollment step"),

    body("learning_goal")
        .if(body("step").equals("learning_goal"))
        .trim()
        .isLength({ min: 8, max: 500 })
        .withMessage("Learning goal must be between 8 and 500 characters"),

    body("interest_topics")
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isLength({ max: 240 })
        .withMessage("Interest topics cannot exceed 240 characters"),

    body("experience_level")
        .if(body("step").equals("learning_goal"))
        .isIn(["Beginner", "Intermediate", "Advanced"])
        .withMessage("Experience level is invalid"),

    body("learning_motivation")
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isLength({ max: 260 })
        .withMessage("Learning motivation cannot exceed 260 characters"),

    body("preferred_difficulty")
        .if(body("step").equals("learning_goal"))
        .isIn(["Beginner", "Intermediate", "Advanced"])
        .withMessage("Preferred difficulty is invalid"),

    body("study_time_per_week")
        .optional({ nullable: true, checkFalsy: true })
        .isIn(["1-3 hours", "4-6 hours", "7-10 hours", "10+ hours"])
        .withMessage("Study time per week is invalid"),

    body("accepted_terms")
        .if(body("step").equals("agreement"))
        .equals("true")
        .withMessage("You must accept the enrollment agreement")
];
