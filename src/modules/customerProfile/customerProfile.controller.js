import asyncHandler from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/response.js";
import {
    deleteProfile_Services,
    displayProfile_Services,
    editProfile_Services,
} from "./customerProfile.service.js";

export const displayProfileDetails = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const customerDetails = await displayProfile_Services(userId);

    return sendResponse(
        res,
        200,
        "Profile details fetched successfully",
        customerDetails
    );
});

export const editProfileDetails = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const payload = { ...req.body };

    if (req.file?.path) {
        payload.photo = req.file.path;
    }

    const updatedProfile = await editProfile_Services(userId, payload);

    return sendResponse(
        res,
        200,
        "Profile updated successfully",
        updatedProfile
    );
});

export const deleteProfileDetails = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    await deleteProfile_Services(userId);

    return sendResponse(res, 200, "Profile deleted successfully");
});
