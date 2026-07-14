import asyncHandler from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/response.js";
import pagination from "../../utils/pagination.js";
import ApiError from "../../utils/ApiError.js";
import {
    displayAllKYC_Vender_Services,
    displayKYC_Vender_fullDetails_Services,
    documentVerification_Services,
} from "./kyc.service.js";
import { documentVerificationSchema } from "./kyc.validation.js";

export const displayAllKYC_Vender = asyncHandler(async (req, res) => {
    const { page, limit, skip } = pagination(req.query);
    const { search, status } = req.query;

    const result = await displayAllKYC_Vender_Services({
        page,
        limit,
        skip,
        search,
        status,
    });

    return sendResponse(res, 200, "KYC vendors fetched successfully", result);
});

export const displayKYC_Vender_fullDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await displayKYC_Vender_fullDetails_Services(id);

    return sendResponse(
        res,
        200,
        "KYC vendor details fetched successfully",
        result
    );
});

export const documentVerification = asyncHandler(async (req, res) => {
    const { error, value } = documentVerificationSchema.validate(req.body, {
        abortEarly: true,
        stripUnknown: true,
    });

    if (error) {
        throw new ApiError(400, error.details[0].message);
    }

    const { id } = req.params;
    const result = await documentVerification_Services(id, value);

    return sendResponse(
        res,
        200,
        "Document status updated successfully",
        result
    );
});
