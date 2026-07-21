import * as vendorProductService from "./vendorProduct.service.js";
import { sendResponse } from "../../utils/response.js";
import pagination from "../../utils/pagination.js";
import Vendor from "../vendor/vendor.model.js";

// We extract vendorId either from DB (via JWT userId) OR req.body.vendorId for flexibility
const getVendorId = async (req) => {
    if (req.user?.userId) {
        const vendor = await Vendor.findOne({ ownerId: req.user.userId }).select("_id");
        if (vendor) return vendor._id.toString();
    }
    return req.body.vendorId || req.query.vendorId;
};

export const createListing = async (req, res, next) => {
    try {
        const vendorId = await getVendorId(req);

        let payload = { ...req.body };

        // Handle FormData string conversions
        if (payload.createNewMaster === 'true') payload.createNewMaster = true;
        if (payload.createNewMaster === 'false') payload.createNewMaster = false;

        if (payload.mrp) payload.mrp = Number(payload.mrp);
        if (payload.sellingPrice) payload.sellingPrice = Number(payload.sellingPrice);
        if (payload.stockQuantity) payload.stockQuantity = Number(payload.stockQuantity);
        if (payload.minOrderQuantity) payload.minOrderQuantity = Number(payload.minOrderQuantity);

        // Parse stringified masterData
        if (typeof payload.masterData === 'string') {
            payload.masterData = JSON.parse(payload.masterData);
        }

        // Attach uploaded image paths to masterData if present
        if (req.files && payload.masterData) {
            if (req.files.thumbnail && req.files.thumbnail[0]) {
                payload.masterData.thumbnail = req.files.thumbnail[0].path;
            }
            if (req.files.images && req.files.images.length > 0) {
                payload.masterData.images = req.files.images.map(file => file.path);
            }
        }

        const listing = await vendorProductService.addVendorListing(vendorId, payload);
        return sendResponse(res, 201, "Product listed successfully", listing);
    } catch (error) {
        next(error);
    }
};

export const bulkCreateListings = async (req, res, next) => {
    try {
        const vendorId = await getVendorId(req);

        if (!req.body.products || !Array.isArray(req.body.products)) {
            return res.status(400).json({ success: false, message: "A products array is required" });
        }

        const result = await vendorProductService.bulkAddVendorListings(vendorId, req.body.products);
        return sendResponse(res, 201, "Bulk upload completed", result);
    } catch (error) {
        next(error);
    }
};

export const getListings = async (req, res, next) => {
    try {
        const vendorId = await getVendorId(req);
        const { page, limit, skip } = pagination(req.query);
        const { warehouseId } = req.query;
        const result = await vendorProductService.getVendorListings(vendorId, { page, limit, skip, warehouseId });
        return sendResponse(res, 200, "Your listings retrieved successfully", result);
    } catch (error) {
        next(error);
    }
};

export const searchListings = async (req, res, next) => {
    try {
        const { page, limit, skip } = pagination(req.query);
        const result = await vendorProductService.searchVendorProducts(req.query, { page, limit, skip });
        return sendResponse(res, 200, "Vendor products retrieved successfully", result);
    } catch (error) {
        next(error);
    }
};

export const getListingDetails = async (req, res, next) => {
    try {
        const { listingId } = req.query;
        if (!listingId) {
            return res.status(400).json({ success: false, message: "listingId is required as a query parameter" });
        }
        const userId = req.user.userId;
        const result = await vendorProductService.getListingDetails(listingId, userId);
        return sendResponse(res, 200, "Listing details retrieved successfully", result);
    } catch (error) {
        next(error);
    }
};

export const updateListing = async (req, res, next) => {
    try {
        const vendorId = await getVendorId(req);
        const listingId = req.params.id;
        const updatedListing = await vendorProductService.updateVendorListing(listingId, vendorId, req.body);
        return sendResponse(res, 200, "Listing updated successfully", updatedListing);
    } catch (error) {
        next(error);
    }
};

export const deleteListing = async (req, res, next) => {
    try {
        const vendorId = await getVendorId(req);
        await vendorProductService.deleteVendorListing(req.params.id, vendorId);
        return sendResponse(res, 200, "Listing removed successfully");
    } catch (error) {
        next(error);
    }
};
