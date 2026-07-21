import Warehouse from "./warehouse.model.js";
import WarehouseStaff from "./warehouseStaff.model.js";

export const createStaff = async (data) => {
    return await WarehouseStaff.create(data);
};

export const getStaffByWarehouse = async (warehouseId, vendorId) => {
    return await WarehouseStaff.find({ warehouseId, vendorId }).sort({ createdAt: -1 });
};

export const updateStaffStatus = async (staffId, vendorId, isActive) => {
    return await WarehouseStaff.findOneAndUpdate(
        { _id: staffId, vendorId },
        { isActive },
        { new: true }
    );
};
export const createWarehouse = async (data) => {
    return await Warehouse.create(data);
};

export const findWarehousesByVendor = async (vendorId) => {
    return await Warehouse.find({ vendorId, isActive: true }).sort({ createdAt: -1 });
};

export const findWarehouseById = async (id, vendorId) => {
    return await Warehouse.findOne({ _id: id, vendorId, isActive: true });
};

export const updateWarehouse = async (id, vendorId, updateData) => {
    return await Warehouse.findOneAndUpdate(
        { _id: id, vendorId, isActive: true },
        updateData,
        { new: true, runValidators: true }
    );
};

export const softDeleteWarehouse = async (id, vendorId) => {
    return await Warehouse.findOneAndUpdate(
        { _id: id, vendorId },
        { isActive: false },
        { new: true }
    );
};
