import * as vendorProductService from "./vendorProduct.service.js";
import { sendResponse } from "../../utils/response.js";
import pagination from "../../utils/pagination.js";

// We extract vendorId either from JWT req.user.vendorId OR req.body.vendorId for flexibility during testing
const getVendorId = (req) => {
    return req.user?.vendorId || req.body.vendorId || req.query.vendorId;
};

export const createListing = async (req, res, next) => {
    try {
        const vendorId = getVendorId(req);
        const listing = await vendorProductService.addVendorListing(vendorId, req.body);
        return sendResponse(res, 201, "Product listed successfully", listing);
    } catch (error) {
        next(error);
    }
};

export const getListings = async (req, res, next) => {
    try {
        const vendorId = getVendorId(req);
        const listings = await vendorProductService.getVendorListings(vendorId);
        return sendResponse(res, 200, "Your listings retrieved successfully", listings);
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
        const result = await vendorProductService.getListingDetails(listingId);
        return sendResponse(res, 200, "Listing details retrieved successfully", result);
    } catch (error) {
        next(error);
    }
};

export const updateListing = async (req, res, next) => {
    try {
        const vendorId = getVendorId(req);
        const listingId = req.params.id;
        const updatedListing = await vendorProductService.updateVendorListing(listingId, vendorId, req.body);
        return sendResponse(res, 200, "Listing updated successfully", updatedListing);
    } catch (error) {
        next(error);
    }
};

export const deleteListing = async (req, res, next) => {
    try {
        const vendorId = getVendorId(req);
        await vendorProductService.deleteVendorListing(req.params.id, vendorId);
        return sendResponse(res, 200, "Listing removed successfully");
    } catch (error) {
        next(error);
    }
};
