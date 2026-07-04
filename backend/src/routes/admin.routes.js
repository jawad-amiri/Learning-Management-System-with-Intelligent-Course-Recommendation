import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import {
    getAllUsers,
    getUserDetails,
    deleteUser,
    createAdmin,
    downgradeAdmin,
    deleteAdmin
} from "../controllers/admin.controller.js";


const router = express.Router();

/**
 * GET /api/admin/users
 * Get all users (admin only)
 */
router.get(
    "/users",
    authMiddleware,
    roleMiddleware("admin", "super_admin"),
    getAllUsers
);

/**
 * GET /api/admin/users/:id
 * Get user detial (admin only)
 */
router.get(
    "/users/:id",
    authMiddleware,
    roleMiddleware("admin", "super_admin"),
    getUserDetails
);

/**
 * DELETE /api/admin/users/:id
 * Delete users (admin only)
 */
router.delete(
    "/users/:id",
    authMiddleware,
    roleMiddleware("admin"),
    deleteUser
);

/**
 * POST /api/admin/users/:id/upgrade
 * Create admin acount (super admin only)
 */
router.post(
    "/users/upgrade/:id",
    authMiddleware,
    roleMiddleware("super_admin"),
    createAdmin
);

/**
 * POST /api/admin/users/downgrade/:id
 * Create admin acount (super admin only)
 */
router.post(
    "/users/downgrade/:id",
    authMiddleware,
    roleMiddleware("super_admin"),
    downgradeAdmin
);

/**
 * DELETE /api/admin/super/users/:id
 * delete users by super admin
 */
router.delete(
    "/super/users/:id",
    authMiddleware,
    roleMiddleware("super_admin"),
    deleteAdmin
);

export default router;
