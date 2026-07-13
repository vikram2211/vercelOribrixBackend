import asyncHandler from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/response.js";
import { displayProfile_Services } from "./customerProfile.service.js";

export const displayProfileDetails = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    console.log(userId, "userId");

    const userDetails = await displayProfile_Services(userId);
    console.log(userDetails, "userDetails");
    if (!userDetails) {
        return sendError(res, 404, "Profile not found");
    }
    const customerDetails = {

        name: userDetails.fullName,
        photo: "",
        email: userDetails.email,
        mobile: userDetails.mobile

    }

    return sendResponse(
        res,
        200,
        "Profile details fetched successfully",
        customerDetails
    );
});

export const editProfileDetails = asyncHandler(async (req, res) => {
})

export const deleteProfileDetails = asyncHandler(async (req, res) => {
})
