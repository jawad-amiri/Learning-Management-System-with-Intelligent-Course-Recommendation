import { recommendationService } from "../services/recommendation.service.js";
import { sendResponse } from "../utils/response.js";

export const getRecommendations = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const recommendations = await recommendationService(userId);

        sendResponse(res, 200, "Data fetched Successfylly", recommendations);
    } catch (error) {
        next(error)
    }
};