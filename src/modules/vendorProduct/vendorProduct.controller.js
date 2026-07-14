import * as vendorProductService from "./vendorProduct.service.js";
import { sendResponse } from "../../utils/response.js";

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
        // e.g., ?subCategoryId=65abcd...
        const listings = await vendorProductService.searchVendorProducts(req.query);
        return sendResponse(res, 200, "Vendor products retrieved successfully", listings);
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
