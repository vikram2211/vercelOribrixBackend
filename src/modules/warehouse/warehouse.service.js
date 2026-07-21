import * as warehouseRepo from "./warehouse.repository.js";
import ApiError from "../../utils/ApiError.js";
import VendorProduct from '../vendorProduct/vendorProduct.model.js';

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
    const warehouses = await warehouseRepo.findWarehousesByVendor(vendorId);

    // Augment with real SKU count & Manager from staff collection
    const augmentedWarehouses = await Promise.all(warehouses.map(async (wh) => {
        const skuCount = await VendorProduct.countDocuments({ warehouseId: wh._id, vendorId: vendorId, isDeleted: { $ne: true } });

        // Find a staff member representing the manager (case insensitive match for 'manager')
        const staffList = await warehouseRepo.getStaffByWarehouse(wh._id, vendorId);
        const manager = staffList.find(s => s.jobRole && s.jobRole.toLowerCase().includes('manager') && s.isActive)
            || staffList.find(s => s.isActive) // fallback to first active staff
            || null;

        return {
            ...wh.toObject(),
            skus: skuCount,
            manager: manager ? { name: manager.name, role: manager.jobRole, phone: manager.phone } : null
        };
    }));

    return augmentedWarehouses;
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

export const addStaff = async (vendorId, data) => {
    if (!data.warehouseId || !data.name || !data.jobRole) {
        throw new ApiError(400, "Warehouse ID, Name, and Job Role are required");
    }

    const existingWh = await warehouseRepo.findWarehouseById(data.warehouseId, vendorId);
    if (!existingWh) {
        throw new ApiError(404, "Warehouse not found");
    }

    return await warehouseRepo.createStaff({
        ...data,
        vendorId
    });
};

export const getWarehouseStaff = async (warehouseId, vendorId) => {
    if (!warehouseId) throw new ApiError(400, "Warehouse ID is required");
    return await warehouseRepo.getStaffByWarehouse(warehouseId, vendorId);
};

export const changeStaffStatus = async (staffId, vendorId, isActive) => {
    return await warehouseRepo.updateStaffStatus(staffId, vendorId, isActive);
};
