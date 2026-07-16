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

export const editWarehouse = async (id, vendorId, data) => {
    if (!id || !vendorId) {
        throw new ApiError(400, "Warehouse ID and Vendor ID are required");
    }

    const warehouse = await warehouseRepo.updateWarehouse(id, vendorId, data);

    if (!warehouse) {
        throw new ApiError(404, "Warehouse not found or you do not have permission to edit it");
    }
    return warehouse;
};

export const removeWarehouse = async (id, vendorId) => {
    if (!id || !vendorId) {
        throw new ApiError(400, "Warehouse ID and Vendor ID are required");
    }

    // Verify it exists first
    const existing = await warehouseRepo.findWarehouseById(id, vendorId);
    if (!existing) {
        throw new ApiError(404, "Warehouse not found or already deleted");
    }

    return await warehouseRepo.softDeleteWarehouse(id, vendorId);
};
