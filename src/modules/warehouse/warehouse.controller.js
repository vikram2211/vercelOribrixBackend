import * as warehouseService from "./warehouse.service.js";
import { sendResponse } from "../../utils/response.js";

// Utility to grab vendorId dynamically for testing if auth middleware isn't wired perfectly yet
const getVendorId = (req) => {
    return req.user?.vendorId || req.body.vendorId || req.query.vendorId;
};

export const createWarehouse = async (req, res, next) => {
    try {
        const vendorId = getVendorId(req);
        const warehouse = await warehouseService.addWarehouse(vendorId, req.body);
        return sendResponse(res, 201, "Warehouse created successfully", warehouse);
    } catch (error) {
        next(error);
    }
};

export const getMyWarehouses = async (req, res, next) => {
    try {
        const vendorId = getVendorId(req);
        const warehouses = await warehouseService.getWarehouses(vendorId);
        return sendResponse(res, 200, "Warehouses retrieved successfully", warehouses);
    } catch (error) {
        next(error);
    }
};
