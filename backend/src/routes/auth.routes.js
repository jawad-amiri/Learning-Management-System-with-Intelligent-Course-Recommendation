import express from 'express';
import { register, login, myInfo } from '../controllers/auth.controller.js';
import { registerValidator, loginValidator } from "../validators/auth.validator.js";
import { validationResult } from 'express-validator';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

//middleware for handling validation errors

const handleValidation = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res
            .status(400)
            .json({
                success: false,
                errors: errors.array()
            });
    }

    next();
}

// Register
router.post(
    '/register',
    registerValidator,
    handleValidation,
    register
);

//Login
router.post(
    '/login',
    loginValidator,
    handleValidation,
    login
);

router.post(
    "/me",
    authMiddleware,
    myInfo
);

export default router;
