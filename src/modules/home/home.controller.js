import asyncHandler from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/response.js";
import * as homeService from "./home.service.js";

export const getMobileHomeData = asyncHandler(async (req, res) => {
    const data = await homeService.getMobileHomeData(req.user.userId);
    return sendResponse(res, 200, "Home screen data fetched successfully", data);
});
