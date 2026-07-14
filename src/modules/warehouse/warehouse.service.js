import * as warehouseRepo from "./warehouse.repository.js";
import ApiError from "../../utils/ApiError.js";

export const addWarehouse = async (vendorId, data) => {
    if (!vendorId) {
        throw new ApiError(400, "Vendor ID is required to create a warehouse");
    }

    if (!data.name) {
        throw new ApiError(400, "Warehouse name is required");
    }

    return await warehouseRepo.createWarehouse({
        ...data,
        vendorId
    });
};

export const getWarehouses = async (vendorId) => {
    if (!vendorId) {
        throw new ApiError(400, "Vendor ID is required");
    }
    return await warehouseRepo.findWarehousesByVendor(vendorId);
};
