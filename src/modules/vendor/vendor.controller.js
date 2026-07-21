import * as vendorService from "./vendor.service.js";
import { sendResponse } from "../../utils/response.js";
import ApiError from "../../utils/ApiError.js";

export const register = async (req, res, next) => {
    try {
        const result = await vendorService.registerVendor(req.body);
        return sendResponse(res, 201, "Vendor registration successful", result);
    } catch (error) {
        next(error);
    }
};

export const updateVendor = async (req, res, next) => {
    try {
        const vendorId = req.params.vendorId;
        const result = await vendorService.modifyVendorData(vendorId, req.body);
        return sendResponse(res, 200, "Vendor details updated successfully", result);
    } catch (error) {
        next(error);
    }
};

export const uploadKYC = async (req, res, next) => {
    try {
        const vendorId = req.params.vendorId;
        if (!req.files) throw new ApiError(400, "No files uploaded");

        const vendor = await vendorService.updateKYCDocuments(vendorId, req.files);
        return sendResponse(res, 200, "KYC documents uploaded successfully", vendor);
    } catch (error) {
        next(error);
    }
};

export const getStatus = async (req, res, next) => {
    try {
        const userId = req.body?.userId || req.params?.userId; // Mock auth for now
        const vendor = await vendorService.getVendorProfile(userId);
        if (!vendor) throw new ApiError(404, "Vendor profile not found");

        return sendResponse(res, 200, "Vendor status retrieved", vendor);
    } catch (error) {
        next(error);
    }
};
