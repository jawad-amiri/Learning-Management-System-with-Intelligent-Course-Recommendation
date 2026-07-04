import { sendResponse } from "../utils/response.js";

const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return sendResponse(res, 403, 'Forbidden');
        }
        next();
    };
};

export default roleMiddleware;