import Vendor from "../vendor/vendor.model.js";
import User from "../user/user.model.js";
import Role from "../role/role.model.js";
import Session from "../session/session.model.js";
import Warehouse from "../warehouse/warehouse.model.js";
import CustomerProfile from "../customerProfile/customerProfile.model.js";
import siteModel from "../site/site.model.js";
import addressModel from "../address/address.model.js";
import Permission from "./permissions.model.js";
import Product from "../product/product.model.js";
import VendorProduct from "../vendorProduct/vendorProduct.model.js";
import Category from "../category/category.model.js";
import Brand from "../brand/brand.model.js";
import SubCategory from "../subCategory/subCategory.model.js";

const notDeleted = { isDelete: { $ne: true } };

// ─── Shared ───────────────────────────────────────────────

export const findRoleByName = async (roleName) => {
    return await Role.findOne({ name: roleName });
};

export const findUserByEmailExcludingId = async (email, userId) => {
    return await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: userId },
    });
};

export const findUserByMobileExcludingId = async (mobile, userId) => {
    return await User.findOne({
        mobile,
        _id: { $ne: userId },
    });
};

// ─── Vendor ───────────────────────────────────────────────

export const findVendorsPaginated = async ({ skip, limit, search, status }) => {
    const filter = {};

    if (status) {
        filter.status = status;
    }

    if (search) {
        const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = { $regex: escaped, $options: "i" };
        filter.$or = [
            { "ownerDetails.fullName": regex },
            { "ownerDetails.email": regex },
            { "ownerDetails.mobile": regex },
            { "businessDetails.legalBusinessName": regex },
            { "businessDetails.tradeName": regex },
            { "businessDetails.gstin": regex },
        ];
    }

    const [vendors, total] = await Promise.all([
        Vendor.find(filter)
            .select(
                "ownerDetails businessDetails status kycDocuments createdAt updatedAt"
            )
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Vendor.countDocuments(filter),
    ]);

    return { vendors, total };
};

export const findVendorApplicationsPaginated = async ({
    skip,
    limit,
    search,
}) => {
    const filter = {
        status: { $nin: ["APPROVED", "ACCEPTED", "accepted"] },
    };

    if (search) {
        const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = { $regex: escaped, $options: "i" };
        filter.$or = [
            { "ownerDetails.fullName": regex },
            { "ownerDetails.email": regex },
            { "ownerDetails.mobile": regex },
            { "businessDetails.legalBusinessName": regex },
            { "businessDetails.tradeName": regex },
            { "businessDetails.gstin": regex },
        ];
    }

    const [vendors, total] = await Promise.all([
        Vendor.find(filter)
            .select(
                "ownerDetails businessDetails status kycDocuments createdAt updatedAt"
            )
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Vendor.countDocuments(filter),
    ]);

    return { vendors, total };
};

export const findVendorDetailsById = async (vendorId) => {
    const vendor = await Vendor.findById(vendorId)
        .populate("productCategories", "name")
        .populate(
            "ownerId",
            "fullName email mobile isActive isVerified lastLogin"
        )
        .lean();

    if (!vendor) return null;

    const warehouses = await Warehouse.find({ vendorId })
        .sort({ createdAt: -1 })
        .lean();

    return { vendor, warehouses };
};

export const updateVendorById = async (vendorId, updateData) => {
    return await Vendor.findByIdAndUpdate(
        vendorId,
        { $set: updateData },
        { new: true, runValidators: true }
    )
        .populate("productCategories", "name")
        .populate(
            "ownerId",
            "fullName email mobile isActive isVerified lastLogin"
        )
        .lean();
};

export const updateOwnerUser = async (ownerId, updateData) => {
    return await User.findByIdAndUpdate(
        ownerId,
        { $set: updateData },
        { new: true, runValidators: true }
    );
};

export const softDeleteVendor = async (vendorId) => {
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return null;

    vendor.status = "SUSPENDED";
    await vendor.save();

    if (vendor.ownerId) {
        await User.findByIdAndUpdate(vendor.ownerId, {
            $set: { isActive: false },
        });
        await Session.deleteMany({ userId: vendor.ownerId });
    }

    return vendor;
};

// ─── Warehouse ────────────────────────────────────────────

export const findVendorById = async (vendorId) => {
    return await Vendor.findById(vendorId)
        .select("ownerDetails businessDetails status")
        .lean();
};

export const findAllWarehousesByVendor = async (vendorId) => {
    return await Warehouse.find({ vendorId }).sort({ createdAt: -1 }).lean();
};

// ─── Customer ─────────────────────────────────────────────

export const findCustomersPaginated = async ({
    skip,
    limit,
    search,
    name,
    email,
    phone,
    pincode,
    isActive,
}) => {
    const customerRole = await findRoleByName("CUSTOMER");
    if (!customerRole) {
        return { customers: [], total: 0 };
    }

    const filter = { role: customerRole._id };

    if (isActive !== null && isActive !== undefined) {
        filter.isActive = isActive;
    }

    const andConditions = [];

    if (search) {
        const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = { $regex: escaped, $options: "i" };
        andConditions.push({
            $or: [
                { fullName: regex },
                { email: regex },
                { mobile: regex },
                { pincode: regex },
            ],
        });
    }

    if (name) {
        const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        andConditions.push({
            fullName: { $regex: escaped, $options: "i" },
        });
    }

    if (email) {
        const escaped = email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        andConditions.push({
            email: { $regex: escaped, $options: "i" },
        });
    }

    if (phone) {
        const escaped = phone.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        andConditions.push({
            mobile: { $regex: escaped, $options: "i" },
        });
    }

    if (pincode) {
        const escaped = pincode.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        andConditions.push({
            pincode: { $regex: escaped, $options: "i" },
        });
    }

    if (andConditions.length) {
        filter.$and = andConditions;
    }

    const [customers, total] = await Promise.all([
        User.find(filter)
            .select(
                "fullName email mobile photo pincode isActive isVerified createdAt updatedAt"
            )
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        User.countDocuments(filter),
    ]);

    const customerIds = customers.map((c) => c._id);
    const profiles = await CustomerProfile.find({
        userId: { $in: customerIds },
    })
        .select("userId persona companyName onboardingComplete")
        .lean();

    const profileByUserId = Object.fromEntries(
        profiles.map((p) => [String(p.userId), p])
    );

    const enriched = customers.map((customer) => ({
        ...customer,
        profile: profileByUserId[String(customer._id)] || null,
    }));

    return { customers: enriched, total };
};

export const findCustomerById = async (customerId) => {
    const customerRole = await findRoleByName("CUSTOMER");
    if (!customerRole) return null;

    const user = await User.findOne({
        _id: customerId,
        role: customerRole._id,
    })
        .select("-password -otp -otpExpiry -twoFactorSecret")
        .lean();

    if (!user) return null;

    const [profile, sites, addresses] = await Promise.all([
        CustomerProfile.findOne({ userId: customerId }).lean(),
        siteModel
            .find({ userId: customerId, ...notDeleted })
            .sort({ createdAt: -1 })
            .lean(),
        addressModel
            .find({ userId: customerId, ...notDeleted })
            .populate("siteId", "siteName")
            .sort({ createdAt: -1 })
            .lean(),
    ]);

    return { user, profile, sites, addresses };
};

export const updateCustomerUser = async (customerId, updateData) => {
    const customerRole = await findRoleByName("CUSTOMER");
    if (!customerRole) return null;

    return await User.findOneAndUpdate(
        { _id: customerId, role: customerRole._id },
        { $set: updateData },
        { new: true, runValidators: true }
    )
        .select("-password -otp -otpExpiry -twoFactorSecret")
        .lean();
};

export const updateCustomerProfile = async (customerId, updateData) => {
    return await CustomerProfile.findOneAndUpdate(
        { userId: customerId },
        { $set: updateData },
        { new: true, runValidators: true }
    ).lean();
};

export const softDeleteCustomer = async (customerId) => {
    const customerRole = await findRoleByName("CUSTOMER");
    if (!customerRole) return null;

    const deletedUser = await User.findOneAndUpdate(
        { _id: customerId, role: customerRole._id, isActive: true },
        { $set: { isActive: false } },
        { new: true }
    );

    if (deletedUser) {
        await Session.deleteMany({ userId: customerId });
    }

    return deletedUser;
};

// ─── Sub Admin ────────────────────────────────────────────

export const findUserByEmail = async (email) => {
    return await User.findOne({ email: email.toLowerCase() });
};

export const findUserByMobile = async (mobile) => {
    return await User.findOne({ mobile });
};

export const createSubAdminUser = async (data) => {
    const created = await User.create(data);
    return await User.findById(created._id)
        .select("-password -otp -otpExpiry -twoFactorSecret")
        .populate("role", "name")
        .lean();
};

export const findSubAdminsPaginated = async ({ skip, limit, search, isActive }) => {
    const subAdminRole = await findRoleByName("SUB_ADMIN");
    if (!subAdminRole) {
        return { subAdmins: [], total: 0 };
    }

    const filter = { role: subAdminRole._id };

    if (isActive !== null && isActive !== undefined) {
        filter.isActive = isActive;
    }

    if (search) {
        const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = { $regex: escaped, $options: "i" };
        filter.$or = [{ fullName: regex }, { email: regex }, { mobile: regex }];
    }

    const [subAdmins, total] = await Promise.all([
        User.find(filter)
            .select("-password -otp -otpExpiry -twoFactorSecret")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        User.countDocuments(filter),
    ]);

    return { subAdmins, total };
};

export const findSubAdminById = async (subAdminId) => {
    const subAdminRole = await findRoleByName("SUB_ADMIN");
    if (!subAdminRole) return null;

    return await User.findOne({ _id: subAdminId, role: subAdminRole._id })
        .select("-password -otp -otpExpiry -twoFactorSecret")
        .lean();
};

export const updateSubAdminUser = async (subAdminId, updateData) => {
    const subAdminRole = await findRoleByName("SUB_ADMIN");
    if (!subAdminRole) return null;

    return await User.findOneAndUpdate(
        { _id: subAdminId, role: subAdminRole._id },
        { $set: updateData },
        { new: true, runValidators: true }
    )
        .select("-password -otp -otpExpiry -twoFactorSecret")
        .lean();
};

export const softDeleteSubAdmin = async (subAdminId) => {
    const subAdminRole = await findRoleByName("SUB_ADMIN");
    if (!subAdminRole) return null;

    const deletedUser = await User.findOneAndUpdate(
        { _id: subAdminId, role: subAdminRole._id, isActive: true },
        { $set: { isActive: false } },
        { new: true }
    );

    if (deletedUser) {
        await Session.deleteMany({ userId: subAdminId });
    }

    return deletedUser;
};

// ─── Admin profile (self) ─────────────────────────────────

export const findAdminProfileById = async (userId) => {
    const [adminRole, subAdminRole] = await Promise.all([
        findRoleByName("ADMIN"),
        findRoleByName("SUB_ADMIN"),
    ]);

    const roleIds = [adminRole?._id, subAdminRole?._id].filter(Boolean);
    if (!roleIds.length) return null;

    return await User.findOne({ _id: userId, role: { $in: roleIds } })
        .select("-password -otp -otpExpiry -twoFactorSecret -coppyPassword")
        .populate("role", "name")
        .lean();
};

export const updateAdminProfile = async (userId, updateData) => {
    const [adminRole, subAdminRole] = await Promise.all([
        findRoleByName("ADMIN"),
        findRoleByName("SUB_ADMIN"),
    ]);

    const roleIds = [adminRole?._id, subAdminRole?._id].filter(Boolean);
    if (!roleIds.length) return null;

    return await User.findOneAndUpdate(
        { _id: userId, role: { $in: roleIds } },
        { $set: updateData },
        { new: true, runValidators: true }
    )
        .select("-password -otp -otpExpiry -twoFactorSecret -coppyPassword")
        .populate("role", "name")
        .lean();
};

// ─── Permissions ──────────────────────────────────────────

export const createPermission = async (data) => {
    return await Permission.create(data);
};

export const findAllPermissions = async () => {
    return await Permission.find().sort({ createdAt: -1 }).lean();
};

export const findPermissionById = async (permissionId) => {
    return await Permission.findById(permissionId).lean();
};

export const findPermissionByName = async (name) => {
    return await Permission.findOne({ name });
};

export const updatePermissionById = async (permissionId, updateData) => {
    return await Permission.findByIdAndUpdate(
        permissionId,
        { $set: updateData },
        { new: true, runValidators: true }
    ).lean();
};

export const deletePermissionById = async (permissionId) => {
    return await Permission.findByIdAndDelete(permissionId);
};

// ─── Products ─────────────────────────────────────────────

const populateProduct = (query) =>
    query
        .populate("categoryId", "name")
        .populate("subCategoryId", "name")
        .populate("brandId", "name");

export const findProductBySlug = async (slug) => {
    return await Product.findOne({ slug });
};

export const findProductsPaginated = async ({
    skip,
    limit,
    search,
    categoryId,
    brandId,
    isActive,
}) => {
    const filter = {};

    if (categoryId) filter.categoryId = categoryId;
    if (brandId) filter.brandId = brandId;
    if (isActive !== null && isActive !== undefined) filter.isActive = isActive;

    if (search) {
        const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = { $regex: escaped, $options: "i" };
        filter.$or = [{ name: regex }, { slug: regex }, { hsnCode: regex }];
    }

    const [products, total] = await Promise.all([
        populateProduct(Product.find(filter))
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Product.countDocuments(filter),
    ]);

    return { products, total };
};

export const findProductById = async (productId) => {
    return await populateProduct(Product.findById(productId)).lean();
};

export const findVendorListingsByProduct = async (productId) => {
    return await VendorProduct.find({ productId })
        .populate("vendorId", "businessDetails ownerDetails status")
        .populate("warehouseId", "name address operatingHours")
        .sort({ sellingPrice: 1 })
        .lean();
};

export const findActiveCategories = async () => {
    return await Category.find({ isActive: true })
        .select("_id name slug")
        .sort({ name: 1 })
        .lean();
};

export const findActiveBrands = async () => {
    return await Brand.find({ isActive: true })
        .select("_id name slug")
        .sort({ name: 1 })
        .lean();
};

export const findActiveSubCategoriesByCategory = async (categoryId) => {
    return await SubCategory.find({ categoryId, isActive: true })
        .select("_id name slug categoryId")
        .sort({ displayOrder: 1, name: 1 })
        .lean();
};

export const createProduct = async (data) => {
    const created = await Product.create(data);
    return await findProductById(created._id);
};

export const updateProductById = async (productId, updateData) => {
    return await populateProduct(
        Product.findByIdAndUpdate(
            productId,
            { $set: updateData },
            { new: true, runValidators: true }
        )
    ).lean();
};

export const deleteProductById = async (productId) => {
    return await Product.findByIdAndDelete(productId);
};