import * as warehouseService from "./warehouse.service.js";
import { sendResponse } from "../../utils/response.js";
import Vendor from "../vendor/vendor.model.js";

// Utility to grab vendorId dynamically for testing if auth middleware isn't wired perfectly yet
const getVendorId = async (req) => {
    let vendorId = req.user?.vendorId || req.body?.vendorId || req.query?.vendorId;

    // If not passed explicitly, attempt to resolve from the authenticated user's profile
    if (!vendorId && req.user?.userId && req.user?.role === "VENDOR_OWNER") {
        const vendorProfile = await Vendor.findOne({ ownerId: req.user.userId });
        if (vendorProfile) {
            vendorId = vendorProfile._id.toString();
        }
    }

    return vendorId;
};

export const createWarehouse = async (req, res, next) => {
    try {
        const vendorId = await getVendorId(req);
        const warehouse = await warehouseService.addWarehouse(vendorId, req.body);
        return sendResponse(res, 201, "Warehouse created successfully", warehouse);
    } catch (error) {
        next(error);
    }
};

export const getMyWarehouses = async (req, res, next) => {
    try {
        const vendorId = await getVendorId(req);
        const warehouses = await warehouseService.getWarehouses(vendorId);
        return sendResponse(res, 200, "Warehouses retrieved successfully", warehouses);
    } catch (error) {
        next(error);
    }
};

export const updateWarehouse = async (req, res, next) => {
    try {
        const vendorId = await getVendorId(req);
        const { id } = req.params;
        const updatedWarehouse = await warehouseService.editWarehouse(id, vendorId, req.body);
        return sendResponse(res, 200, "Warehouse updated successfully", updatedWarehouse);
    } catch (error) {
        next(error);
    }
};

export const deleteWarehouse = async (req, res, next) => {
    try {
        const vendorId = await getVendorId(req);
        const { id } = req.params;

        console.log("=== DEBUG DELETE WAREHOUSE ===");
        console.log("Extracted warehouse id from URL:", id);
        console.log("Resolved vendorId from JWT:", vendorId);

        await warehouseService.removeWarehouse(id, vendorId);
        return sendResponse(res, 200, "Warehouse deleted successfully", null);
    } catch (error) {
        next(error);
    }
};
