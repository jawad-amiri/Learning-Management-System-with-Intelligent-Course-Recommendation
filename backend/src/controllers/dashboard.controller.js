import { sendResponse } from "../utils/response.js";
import { getDashboardDataService } from "../services/dashboard.service.js";

export const getDashboardData = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { role }  = req.user;

        const data = await getDashboardDataService(userId, role);
        sendResponse(res, 200, "Dashboard data retrived successfully", data);
    } catch (error) {
        next(error);
    }
};