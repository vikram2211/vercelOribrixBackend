import Warehouse from "./warehouse.model.js";

export const createWarehouse = async (data) => {
    return await Warehouse.create(data);
};

export const findWarehousesByVendor = async (vendorId) => {
    return await Warehouse.find({ vendorId, isActive: true }).sort({ createdAt: -1 });
};

export const findWarehouseById = async (id, vendorId) => {
    return await Warehouse.findOne({ _id: id, vendorId, isActive: true });
};
