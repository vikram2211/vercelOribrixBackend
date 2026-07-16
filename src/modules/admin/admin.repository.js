import Vendor from "../vendor/vendor.model.js";
import User from "../user/user.model.js";
import Role from "../role/role.model.js";
import Session from "../session/session.model.js";
import Warehouse from "../warehouse/warehouse.model.js";
import CustomerProfile from "../customerProfile/customerProfile.model.js";
import siteModel from "../site/site.model.js";
import addressModel from "../address/address.model.js";

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