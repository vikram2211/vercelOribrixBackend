import Vendor from "./vendor.model.js";
import User from "../user/user.model.js";
import Role from "../role/role.model.js";

export const findUserByEmailOrPhone = async (email, mobile) => {
    return await User.findOne({
        $or: [{ email }, { mobile }]
    });
};

export const findRoleByName = async (roleName) => {
    return await Role.findOne({ name: roleName });
};

export const createUser = async (userData) => {
    return await User.create(userData);
};

export const createVendor = async (vendorData) => {
    return await Vendor.create(vendorData);
};

export const findVendorById = async (vendorId) => {
    return await Vendor.findById(vendorId);
};

export const saveVendor = async (vendor) => {
    return await vendor.save();
};

export const findVendorByOwnerId = async (ownerId) => {
    return await Vendor.findOne({ ownerId }).populate("ownerId", "fullName email mobile");
};
