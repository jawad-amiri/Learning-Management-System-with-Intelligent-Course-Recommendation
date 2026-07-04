import { sendResponse } from "../utils/response.js";
import {
    getAllUsersService,
    getUserDetailService,
    deleteUserService,
    upgradeUserToAdmin,
    downgradeAdminService,
    deleteAdminService
} from "../services/admin.service.js";


//Geting all users for admin
export const getAllUsers = async (req, res, next) => {
    try {
        const users = await getAllUsersService();
        sendResponse(res, 200, "Data fetched successfully", users);
    } catch (error) {
        next(error);
    }
};

//Geting a specific user with detail for admin
export const getUserDetails = async (req, res, next) => {
    try {
        const userId = req.params.id;

        const user = await getUserDetailService(userId);
        sendResponse(res, 200, "Data fetched successfully", user);
    } catch (error) {
        next(error);
    }
};

//deleting a user for admin
export const deleteUser = async (req, res, next) => {
    try {
        const userId = req.params.id;

        await deleteUserService(userId);
        sendResponse(res, 200, "User deleted successfully");
    } catch (error) {
        next(error);
    }
};

//changing a simple user to admin with super admin acount
export const createAdmin = async (req, res, next) => {
    try {
        const userId = req.params.id;

        if (req.user.role !== 'super_admin') {
            return sendResponse(
                res,
                403,
                "Unauthorized, only super admin can create admin acounts"
            );
        }

        await upgradeUserToAdmin(userId);
        sendResponse(res, 200, "User upgraded to admin successfully")
    } catch (error) {
        next(error);
    }
};


//changing an admin to a regular user with super admin acount
export const downgradeAdmin = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const { downgradedTo } = req.body;

        if (req.user.role !== 'super_admin') {
            return sendResponse(
                res,
                403,
                "Unauthorized, only super admin can create admin acounts"
            );
        }

        await downgradeAdminService(downgradedTo.trim(), userId);
        sendResponse(res, 200, `Admin downgraded to ${downgradedTo.trim()} successfully`)
    } catch (error) {
        next(error);
    }
};

//deleting an admin user with super admin acount
export const deleteAdmin = async (req, res, next) => {
    try {
        const userId = req.params.id;

        if (req.user.role !== 'super_admin') {
            return sendResponse(
                res,
                403,
                "Unauthorized"
            );
        }

        await deleteAdminService(userId, req.user.id);

        sendResponse(res, 200, "Admin DELETED!!!");
    } catch (error) {
        next(error);
    }
};