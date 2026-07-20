import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import ApiError from "../../utils/ApiError.js";
import * as adminRepo from "./admin.repository.js";
import * as emailService from "../../services/email.service.js";

const VENDOR_STATUSES = [
    "PENDING_VERIFICATION",
    "APPROVED",
    "REJECTED",
    "SUSPENDED",
];

const PERSONAS = ["Contractor", "Builder", "Homeowner", "Architect"];
const PAYMENT_PREFERENCES = ["UPI", "Card", "EMI via PG", "COD"];

const DOC_KEYS = [
    "gstCert",
    "panCard",
    "cancelledCheque",
    "msmeUdyam",
    "shopAndTradeLicense",
    "ownerAadhaarDoc",
    "oribrixSellerAgreement",
    "iso9001",
];

const DOC_STATUSES = [
    "PENDING",
    "RECEIVED",
    "APPROVED",
    "RE-UPLOAD_REQUESTED",
    "REJECTED",
];

const formatDocument = (doc) => ({
    fileUrl: doc?.fileUrl || "",
    status: doc?.status || "PENDING",
    remarks: doc?.remarks || "",
});

const formatKycDocuments = (kycDocuments = {}) =>
    Object.fromEntries(
        DOC_KEYS.map((key) => [key, formatDocument(kycDocuments[key])])
    );

const normalizeVendorStatus = (status) => {
    if (!status?.trim()) return null;

    const value = status.trim().toUpperCase().replace(/[-\s]/g, "_");
    const map = {
        PENDING_VERIFICATION: "PENDING_VERIFICATION",
        PENDING: "PENDING_VERIFICATION",
        APPROVED: "APPROVED",
        REJECTED: "REJECTED",
        SUSPENDED: "SUSPENDED",
    };

    const normalized = map[value];
    if (!normalized) {
        throw new ApiError(
            400,
            "Invalid status. Use PENDING_VERIFICATION, APPROVED, REJECTED, or SUSPENDED"
        );
    }
    return normalized;
};

// ─── Vendor formatters ────────────────────────────────────

const formatVendorListItem = (vendor) => ({
    vendorId: vendor._id,
    name: vendor.ownerDetails?.fullName || "",
    email: vendor.ownerDetails?.email || "",
    mobile: vendor.ownerDetails?.mobile || "",
    businessName: vendor.businessDetails?.legalBusinessName || "",
    tradeName: vendor.businessDetails?.tradeName || "",
    gstin: vendor.businessDetails?.gstin || "",
    status: vendor.status,
    createdAt: vendor.createdAt,
});

const formatVendorDetails = ({ vendor, warehouses }) => ({
    vendorId: vendor._id,
    ownerId: vendor.ownerId?._id || vendor.ownerId || null,
    owner: {
        fullName:
            vendor.ownerId?.fullName || vendor.ownerDetails?.fullName || "",
        email: vendor.ownerId?.email || vendor.ownerDetails?.email || "",
        mobile: vendor.ownerId?.mobile || vendor.ownerDetails?.mobile || "",
        isActive: vendor.ownerId?.isActive ?? true,
        isVerified: vendor.ownerId?.isVerified ?? false,
        lastLogin: vendor.ownerId?.lastLogin || null,
    },
    ownerDetails: vendor.ownerDetails || {},
    businessDetails: vendor.businessDetails || {},
    bankDetails: vendor.bankDetails || {},
    productCategories: (vendor.productCategories || []).map((cat) => ({
        categoryId: cat._id || cat,
        name: cat.name || "",
    })),
    warehouses: (warehouses || []).map((w) => ({
        warehouseId: w._id,
        name: w.name || "",
        capacity: w.capacity || "",
        address: w.address || "",
        operatingHours: w.operatingHours || "",
        isActive: w.isActive ?? true,
        createdAt: w.createdAt,
    })),
    kycDocuments: formatKycDocuments(vendor.kycDocuments),
    status: vendor.status,
    createdAt: vendor.createdAt,
    updatedAt: vendor.updatedAt,
});

// ─── Customer formatters ──────────────────────────────────

const formatAdminCustomerListItem = (customer) => ({
    customerId: customer._id,
    name: customer.fullName || "",
    email: customer.email || "",
    mobile: customer.mobile || "",
    photo: customer.photo || "",
    pincode: customer.pincode || "",
    persona: customer.profile?.persona || "",
    companyName: customer.profile?.companyName || "",
    onboardingComplete: customer.profile?.onboardingComplete ?? false,
    isActive: customer.isActive,
    isVerified: customer.isVerified,
    createdAt: customer.createdAt,
});

const formatAdminCustomerDetails = ({ user, profile, sites, addresses }) => ({
    customerId: user._id,
    name: user.fullName || "",
    email: user.email || "",
    mobile: user.mobile || "",
    photo: user.photo || "",
    pincode: user.pincode || "",
    isActive: user.isActive,
    isVerified: user.isVerified,
    lastLogin: user.lastLogin || null,
    profile: {
        persona: profile?.persona || "",
        companyName: profile?.companyName || "",
        gstin: profile?.gstin || "",
        teamInvites: profile?.teamInvites || "",
        paymentPreferences: profile?.paymentPreferences || [],
        onboardingComplete: profile?.onboardingComplete ?? false,
    },
    sites: (sites || []).map((site) => ({
        siteId: site._id,
        siteName: site.siteName || "",
        siteAddress: site.siteAddress || "",
        pinCode: site.pinCode || "",
        members: site.members || [],
        createdAt: site.createdAt,
    })),
    addresses: (addresses || []).map((address) => ({
        addressId: address._id,
        siteId: address.siteId?._id || address.siteId || null,
        siteName: address.siteId?.siteName || "",
        fullName: address.fullName || "",
        mobileNo: address.mobileNo || "",
        address: address.address || "",
        landmark: address.landmark || "",
        city: address.city || "",
        state: address.state || "",
        pinCode: address.pinCode || "",
        addressType: address.addressType || "",
        isSelect: address.isSelect ?? false,
        createdAt: address.createdAt,
    })),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});

// ─── Vendor services ──────────────────────────────────────

export const displayVendors_Services = async ({
    page,
    limit,
    skip,
    search,
    status,
}) => {
    const statusFilter = normalizeVendorStatus(status);

    const { vendors, total } = await adminRepo.findVendorsPaginated({
        skip,
        limit,
        search: search?.trim() || "",
        status: statusFilter,
    });

    return {
        vendors: vendors.map(formatVendorListItem),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 0,
        },
    };
};

export const displayVendorsApplication_Services = async ({
    page,
    limit,
    skip,
    search,
}) => {
    const { vendors, total } = await adminRepo.findVendorApplicationsPaginated({
        skip,
        limit,
        search: search?.trim() || "",
    });

    return {
        vendors: vendors.map(formatVendorListItem),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 0,
        },
    };
};

export const displayVendorDetails_Services = async (vendorId) => {
    const result = await adminRepo.findVendorDetailsById(vendorId);
    if (!result) throw new ApiError(404, "Vendor not found");
    return formatVendorDetails(result);
};

export const editVendorDetails_Services = async (vendorId, data) => {
    const existing = await adminRepo.findVendorDetailsById(vendorId);
    if (!existing) throw new ApiError(404, "Vendor not found");

    const { vendor } = existing;
    const updateData = {};
    const ownerUpdate = {};

    if (data.businessDetails !== undefined) {
        if (
            typeof data.businessDetails !== "object" ||
            Array.isArray(data.businessDetails)
        ) {
            throw new ApiError(400, "businessDetails must be an object");
        }
        updateData.businessDetails = {
            ...vendor.businessDetails,
            ...data.businessDetails,
        };
    }

    if (data.ownerDetails !== undefined) {
        if (
            typeof data.ownerDetails !== "object" ||
            Array.isArray(data.ownerDetails)
        ) {
            throw new ApiError(400, "ownerDetails must be an object");
        }
        updateData.ownerDetails = {
            ...vendor.ownerDetails,
            ...data.ownerDetails,
        };

        if (data.ownerDetails.fullName !== undefined) {
            ownerUpdate.fullName = String(data.ownerDetails.fullName).trim();
        }
        if (data.ownerDetails.email !== undefined) {
            const email = String(data.ownerDetails.email).trim().toLowerCase();
            if (!email) throw new ApiError(400, "Email cannot be empty");
            const emailExists = await adminRepo.findUserByEmailExcludingId(
                email,
                vendor.ownerId?._id || vendor.ownerId
            );
            if (emailExists) throw new ApiError(400, "Email already in use");
            ownerUpdate.email = email;
            updateData.ownerDetails.email = email;
        }
        if (data.ownerDetails.mobile !== undefined) {
            const mobile = String(data.ownerDetails.mobile).trim();
            if (!mobile) throw new ApiError(400, "Mobile cannot be empty");
            const mobileExists = await adminRepo.findUserByMobileExcludingId(
                mobile,
                vendor.ownerId?._id || vendor.ownerId
            );
            if (mobileExists) throw new ApiError(400, "Mobile already in use");
            ownerUpdate.mobile = mobile;
            updateData.ownerDetails.mobile = mobile;
        }
    }

    if (data.bankDetails !== undefined) {
        if (
            typeof data.bankDetails !== "object" ||
            Array.isArray(data.bankDetails)
        ) {
            throw new ApiError(400, "bankDetails must be an object");
        }
        updateData.bankDetails = {
            ...vendor.bankDetails,
            ...data.bankDetails,
        };
    }

    if (data.productCategories !== undefined) {
        if (!Array.isArray(data.productCategories)) {
            throw new ApiError(400, "productCategories must be an array");
        }
        updateData.productCategories = data.productCategories;
    }

    if (data.kycDocuments !== undefined) {
        if (
            typeof data.kycDocuments !== "object" ||
            Array.isArray(data.kycDocuments)
        ) {
            throw new ApiError(400, "kycDocuments must be an object");
        }

        const entries = Object.entries(data.kycDocuments);
        if (!entries.length) {
            throw new ApiError(400, "Provide at least one KYC document to update");
        }

        const mergedDocs = { ...(vendor.kycDocuments || {}) };

        for (const [key, payload] of entries) {
            if (!DOC_KEYS.includes(key)) {
                throw new ApiError(400, `Invalid document key: ${key}`);
            }
            if (
                !payload ||
                typeof payload !== "object" ||
                Array.isArray(payload)
            ) {
                throw new ApiError(400, `${key} must be an object`);
            }

            const status = String(payload.status || "")
                .trim()
                .toUpperCase()
                .replace(/[-\s]/g, "_");

            if (!DOC_STATUSES.includes(status)) {
                throw new ApiError(
                    400,
                    `Invalid ${key} status. Use ${DOC_STATUSES.join(", ")}`
                );
            }

            const existing = mergedDocs[key] || {};
            const updatedDoc = {
                fileUrl: existing.fileUrl || "",
                status,
                remarks:
                    payload.remarks !== undefined
                        ? String(payload.remarks)
                        : existing.remarks || "",
            };

            mergedDocs[key] = updatedDoc;
            updateData[`kycDocuments.${key}`] = updatedDoc;
        }
    }

    if (data.status !== undefined) {
        const status = normalizeVendorStatus(String(data.status));
        if (!VENDOR_STATUSES.includes(status)) {
            throw new ApiError(400, "Invalid status");
        }
        updateData.status = status;
    }

    if (Object.keys(updateData).length === 0) {
        throw new ApiError(400, "No fields provided to update");
    }

    const updatedVendor = await adminRepo.updateVendorById(
        vendorId,
        updateData
    );
    if (!updatedVendor) throw new ApiError(404, "Vendor not found");

    if (Object.keys(ownerUpdate).length && vendor.ownerId) {
        await adminRepo.updateOwnerUser(
            vendor.ownerId._id || vendor.ownerId,
            ownerUpdate
        );
    }

    const result = await adminRepo.findVendorDetailsById(vendorId);
    return formatVendorDetails(result);
};

export const deleteVendor_Services = async (vendorId) => {
    const deleted = await adminRepo.softDeleteVendor(vendorId);
    if (!deleted) throw new ApiError(404, "Vendor not found");
    return true;
};

// ─── Warehouse services ───────────────────────────────────

export const displayAllWarehousesByVendor_Services = async (vendorId) => {
    if (!vendorId) {
        throw new ApiError(400, "Vendor ID is required");
    }

    const vendor = await adminRepo.findVendorById(vendorId);
    if (!vendor) {
        throw new ApiError(404, "Vendor not found");
    }

    const warehouses = await adminRepo.findAllWarehousesByVendor(vendorId);

    return {
        vendorId: vendor._id,
        vendorName: vendor.ownerDetails?.fullName || "",
        businessName: vendor.businessDetails?.legalBusinessName || "",
        status: vendor.status,
        warehouses: warehouses.map((w) => ({
            warehouseId: w._id,
            name: w.name || "",
            address: w.address || "",
            capacity: w.capacity || "",
            operatingHours: w.operatingHours || "",
            servicedPincodes: w.servicedPincodes || [],
            isActive: w.isActive ?? true,
            createdAt: w.createdAt,
            updatedAt: w.updatedAt,
        })),
        total: warehouses.length,
    };
};

// ─── Customer services ────────────────────────────────────

export const displayCustomers_Services = async ({
    page,
    limit,
    skip,
    search,
    name,
    email,
    phone,
    pincode,
    isActive,
}) => {
    let activeFilter = null;
    if (
        isActive !== undefined &&
        isActive !== null &&
        String(isActive).trim() !== ""
    ) {
        const value = String(isActive).trim().toLowerCase();
        if (value === "true" || value === "1") activeFilter = true;
        else if (value === "false" || value === "0") activeFilter = false;
        else throw new ApiError(400, "Invalid isActive. Use true or false");
    }

    const { customers, total } = await adminRepo.findCustomersPaginated({
        skip,
        limit,
        search: search?.trim() || "",
        name: name?.trim() || "",
        email: email?.trim() || "",
        phone: phone?.trim() || "",
        pincode: pincode?.trim() || "",
        isActive: activeFilter,
    });

    return {
        customers: customers.map(formatAdminCustomerListItem),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 0,
        },
    };
};

export const displayCustomerDetails_Services = async (customerId) => {
    const result = await adminRepo.findCustomerById(customerId);
    if (!result) {
        throw new ApiError(404, "Customer not found");
    }
    return formatAdminCustomerDetails(result);
};

export const editCustomerDetails_Services = async (customerId, data) => {
    const existing = await adminRepo.findCustomerById(customerId);
    if (!existing) {
        throw new ApiError(404, "Customer not found");
    }

    const userUpdate = {};
    const profileUpdate = {};

    const name = data.name ?? data.fullName;
    if (name !== undefined) {
        const trimmedName = String(name).trim();
        if (!trimmedName) throw new ApiError(400, "Name cannot be empty");
        userUpdate.fullName = trimmedName;
    }

    if (data.email !== undefined) {
        const email = String(data.email).trim().toLowerCase();
        if (!email) throw new ApiError(400, "Email cannot be empty");
        const emailExists = await adminRepo.findUserByEmailExcludingId(
            email,
            customerId
        );
        if (emailExists) throw new ApiError(400, "Email already in use");
        userUpdate.email = email;
    }

    const mobile = data.mobile ?? data.phone ?? data.phoneNo;
    if (mobile !== undefined) {
        const trimmedMobile = String(mobile).trim();
        if (!trimmedMobile) {
            throw new ApiError(400, "Mobile number cannot be empty");
        }
        const mobileExists = await adminRepo.findUserByMobileExcludingId(
            trimmedMobile,
            customerId
        );
        if (mobileExists) {
            throw new ApiError(400, "Mobile number already in use");
        }
        userUpdate.mobile = trimmedMobile;
    }

    if (data.photo !== undefined) userUpdate.photo = data.photo;
    if (data.pincode !== undefined) {
        userUpdate.pincode = String(data.pincode).trim();
    }
    if (data.isActive !== undefined) {
        if (typeof data.isActive !== "boolean") {
            throw new ApiError(400, "isActive must be a boolean");
        }
        userUpdate.isActive = data.isActive;
    }

    if (data.persona !== undefined) {
        if (!PERSONAS.includes(data.persona)) {
            throw new ApiError(
                400,
                `Invalid persona. Use ${PERSONAS.join(", ")}`
            );
        }
        profileUpdate.persona = data.persona;
    }

    if (data.companyName !== undefined) {
        profileUpdate.companyName = String(data.companyName).trim();
    }

    if (data.gstin !== undefined) {
        profileUpdate.gstin = String(data.gstin).trim().toUpperCase();
    }

    if (data.teamInvites !== undefined) {
        profileUpdate.teamInvites = String(data.teamInvites).trim();
    }

    if (data.paymentPreferences !== undefined) {
        if (!Array.isArray(data.paymentPreferences)) {
            throw new ApiError(400, "paymentPreferences must be an array");
        }
        const invalid = data.paymentPreferences.filter(
            (p) => !PAYMENT_PREFERENCES.includes(p)
        );
        if (invalid.length) {
            throw new ApiError(
                400,
                `Invalid paymentPreferences. Use ${PAYMENT_PREFERENCES.join(", ")}`
            );
        }
        profileUpdate.paymentPreferences = data.paymentPreferences;
    }

    if (
        Object.keys(userUpdate).length === 0 &&
        Object.keys(profileUpdate).length === 0
    ) {
        throw new ApiError(400, "No fields provided to update");
    }

    if (Object.keys(userUpdate).length) {
        const updatedUser = await adminRepo.updateCustomerUser(
            customerId,
            userUpdate
        );
        if (!updatedUser) throw new ApiError(404, "Customer not found");
    }

    if (Object.keys(profileUpdate).length) {
        const updatedProfile = await adminRepo.updateCustomerProfile(
            customerId,
            profileUpdate
        );
        if (!updatedProfile) {
            throw new ApiError(
                400,
                "Customer profile not found. Customer must complete onboarding first."
            );
        }
    }

    const result = await adminRepo.findCustomerById(customerId);
    return formatAdminCustomerDetails(result);
};

export const deleteCustomer_Services = async (customerId) => {
    const deleted = await adminRepo.softDeleteCustomer(customerId);
    if (!deleted) {
        throw new ApiError(404, "Customer not found");
    }
    return true;
};

// ─── Sub Admin ────────────────────────────────────────────

const formatSubAdmin = (user) => ({
    subAdminId: user._id,
    fullName: user.fullName || "",
    email: user.email || "",
    mobile: user.mobile || "",
    photo: user.photo || "",
    permissions: user.permissions || [],
    // Plain-text copy of the password so the admin can view/share it
    password: user.coppyPassword || "",
    isActive: user.isActive,
    isVerified: user.isVerified,
    lastLogin: user.lastLogin || null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});

const normalizePermissions = (permissions) => {
    if (permissions === undefined) return undefined;
    if (!Array.isArray(permissions)) {
        throw new ApiError(400, "permissions must be an array of strings");
    }
    return permissions
        .map((p) => String(p).trim())
        .filter((p) => p.length > 0);
};

export const createSubAdmin_Services = async (data) => {
    const fullName = String(data.fullName || "").trim();
    if (!fullName) throw new ApiError(400, "Full name is required");

    const email = String(data.email || "").trim().toLowerCase();
    if (!email) throw new ApiError(400, "Email is required");

    const password = String(data.password || "");
    if (!password) throw new ApiError(400, "Password is required");
    if (password.length < 6) {
        throw new ApiError(400, "Password must be at least 6 characters");
    }

    const emailExists = await adminRepo.findUserByEmail(email);
    if (emailExists) throw new ApiError(400, "Email already in use");

    const payload = {
        fullName,
        email,
        password: await bcrypt.hash(password, 10),
        // Store the plain password copy on create
        coppyPassword: password,
        isVerified: true,
    };

    if (data.mobile !== undefined) {
        const mobile = String(data.mobile).trim();
        if (mobile) {
            const mobileExists = await adminRepo.findUserByMobile(mobile);
            if (mobileExists) throw new ApiError(400, "Mobile already in use");
            payload.mobile = mobile;
        }
    }

    if (data.photo !== undefined) payload.photo = String(data.photo);

    const permissions = normalizePermissions(data.permissions);
    payload.permissions = permissions || [];

    const subAdminRole = await adminRepo.findRoleByName("SUB_ADMIN");
    if (!subAdminRole) {
        throw new ApiError(500, "SUB_ADMIN role not configured");
    }
    payload.role = subAdminRole._id;

    const created = await adminRepo.createSubAdminUser(payload);

    // Send the credentials email (fire-and-forget so it never blocks the response)
    emailService
        .sendSubAdminWelcomeEmail(email, {
            fullName,
            password,
            mobile: payload.mobile,
            permissions: payload.permissions,
        })
        .catch((err) => {
            console.error("Sub admin welcome email failed to send:", err);
        });

    return formatSubAdmin(created);
};

export const displaySubAdmins_Services = async ({
    page,
    limit,
    skip,
    search,
    isActive,
}) => {
    let activeFilter = null;
    if (
        isActive !== undefined &&
        isActive !== null &&
        String(isActive).trim() !== ""
    ) {
        const value = String(isActive).trim().toLowerCase();
        if (value === "true" || value === "1") activeFilter = true;
        else if (value === "false" || value === "0") activeFilter = false;
        else throw new ApiError(400, "Invalid isActive. Use true or false");
    }

    const { subAdmins, total } = await adminRepo.findSubAdminsPaginated({
        skip,
        limit,
        search: search?.trim() || "",
        isActive: activeFilter,
    });

    return {
        subAdmins: subAdmins.map(formatSubAdmin),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 0,
        },
    };
};

export const displaySubAdminDetails_Services = async (subAdminId) => {
    const subAdmin = await adminRepo.findSubAdminById(subAdminId);
    if (!subAdmin) throw new ApiError(404, "Sub admin not found");
    return formatSubAdmin(subAdmin);
};

export const editSubAdminDetails_Services = async (subAdminId, data) => {
    const existing = await adminRepo.findSubAdminById(subAdminId);
    if (!existing) throw new ApiError(404, "Sub admin not found");

    const updateData = {};

    const name = data.fullName ?? data.name;
    if (name !== undefined) {
        const trimmedName = String(name).trim();
        if (!trimmedName) throw new ApiError(400, "Full name cannot be empty");
        updateData.fullName = trimmedName;
    }

    if (data.email !== undefined) {
        const email = String(data.email).trim().toLowerCase();
        if (!email) throw new ApiError(400, "Email cannot be empty");
        const emailExists = await adminRepo.findUserByEmailExcludingId(
            email,
            subAdminId
        );
        if (emailExists) throw new ApiError(400, "Email already in use");
        updateData.email = email;
    }

    if (data.mobile !== undefined) {
        const mobile = String(data.mobile).trim();
        if (mobile) {
            const mobileExists = await adminRepo.findUserByMobileExcludingId(
                mobile,
                subAdminId
            );
            if (mobileExists) throw new ApiError(400, "Mobile already in use");
        }
        updateData.mobile = mobile;
    }

    if (data.photo !== undefined) updateData.photo = String(data.photo);

    if (data.isActive !== undefined) {
        if (typeof data.isActive !== "boolean") {
            throw new ApiError(400, "isActive must be a boolean");
        }
        updateData.isActive = data.isActive;
    }

    const permissions = normalizePermissions(data.permissions);
    if (permissions !== undefined) {
        updateData.permissions = permissions;
    }

    // On edit, only when a new password is provided, save the plain copy too
    if (data.password !== undefined && String(data.password) !== "") {
        const password = String(data.password);
        if (password.length < 6) {
            throw new ApiError(400, "Password must be at least 6 characters");
        }
        updateData.password = await bcrypt.hash(password, 10);
        updateData.coppyPassword = password;
    }

    if (Object.keys(updateData).length === 0) {
        throw new ApiError(400, "No fields provided to update");
    }

    const updated = await adminRepo.updateSubAdminUser(subAdminId, updateData);
    if (!updated) throw new ApiError(404, "Sub admin not found");
    return formatSubAdmin(updated);
};

export const deleteSubAdmin_Services = async (subAdminId) => {
    const deleted = await adminRepo.softDeleteSubAdmin(subAdminId);
    if (!deleted) throw new ApiError(404, "Sub admin not found");
    return true;
};

// ─── Admin profile (self) ─────────────────────────────────

const formatAdminProfile = (user) => ({
    userId: user._id,
    fullName: user.fullName || "",
    email: user.email || "",
    mobile: user.mobile || "",
    photo: user.photo || "",
    role: user.role?.name || "",
    permissions: user.permissions || [],
    isActive: user.isActive,
    isVerified: user.isVerified,
    lastLogin: user.lastLogin || null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});

export const displayAdminProfile_Services = async (userId) => {
    const user = await adminRepo.findAdminProfileById(userId);
    if (!user) throw new ApiError(404, "Admin profile not found");
    return formatAdminProfile(user);
};

export const editAdminProfile_Services = async (userId, data) => {
    const existing = await adminRepo.findAdminProfileById(userId);
    if (!existing) throw new ApiError(404, "Admin profile not found");

    const updateData = {};

    const name = data.fullName ?? data.name;
    if (name !== undefined) {
        const trimmedName = String(name).trim();
        if (!trimmedName) throw new ApiError(400, "Full name cannot be empty");
        updateData.fullName = trimmedName;
    }

    if (data.email !== undefined) {
        const email = String(data.email).trim().toLowerCase();
        if (!email) throw new ApiError(400, "Email cannot be empty");
        const emailExists = await adminRepo.findUserByEmailExcludingId(
            email,
            userId
        );
        if (emailExists) throw new ApiError(400, "Email already in use");
        updateData.email = email;
    }

    if (data.mobile !== undefined || data.phone !== undefined) {
        const mobile = String(data.mobile ?? data.phone).trim();
        if (mobile) {
            const mobileExists = await adminRepo.findUserByMobileExcludingId(
                mobile,
                userId
            );
            if (mobileExists) throw new ApiError(400, "Mobile already in use");
        }
        updateData.mobile = mobile;
    }

    if (data.photo !== undefined) updateData.photo = String(data.photo);

    if (Object.keys(updateData).length === 0) {
        throw new ApiError(400, "No fields provided to update");
    }

    const updated = await adminRepo.updateAdminProfile(userId, updateData);
    if (!updated) throw new ApiError(404, "Admin profile not found");
    return formatAdminProfile(updated);
};

// ─── Permissions ──────────────────────────────────────────

const formatPermission = (permission) => ({
    permissionId: permission._id,
    name: permission.name || "",
    description: permission.description || "",
    createdAt: permission.createdAt,
    updatedAt: permission.updatedAt,
});

export const displayPermissions_Services = async () => {
    const permissions = await adminRepo.findAllPermissions();
    return permissions.map(formatPermission);
};

export const createPermission_Services = async (data) => {
    const name = String(data.name || "").trim();
    if (!name) throw new ApiError(400, "Permission name is required");

    const exists = await adminRepo.findPermissionByName(name);
    if (exists) throw new ApiError(400, "Permission already exists");

    const created = await adminRepo.createPermission({
        name,
        description: data.description ? String(data.description).trim() : "",
    });

    return formatPermission(created.toObject ? created.toObject() : created);
};

export const editPermission_Services = async (permissionId, data) => {
    const existing = await adminRepo.findPermissionById(permissionId);
    if (!existing) throw new ApiError(404, "Permission not found");

    const updateData = {};

    if (data.name !== undefined) {
        const name = String(data.name).trim();
        if (!name) throw new ApiError(400, "Permission name cannot be empty");
        const duplicate = await adminRepo.findPermissionByName(name);
        if (duplicate && String(duplicate._id) !== String(permissionId)) {
            throw new ApiError(400, "Permission already exists");
        }
        updateData.name = name;
    }

    if (data.description !== undefined) {
        updateData.description = String(data.description).trim();
    }

    if (Object.keys(updateData).length === 0) {
        throw new ApiError(400, "No fields provided to update");
    }

    const updated = await adminRepo.updatePermissionById(permissionId, updateData);
    if (!updated) throw new ApiError(404, "Permission not found");
    return formatPermission(updated);
};

export const deletePermission_Services = async (permissionId) => {
    const deleted = await adminRepo.deletePermissionById(permissionId);
    if (!deleted) throw new ApiError(404, "Permission not found");
    return true;
};

// ─── Products ─────────────────────────────────────────────

const assertObjectId = (value, field) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new ApiError(400, `Invalid ${field}`);
    }
};

const slugify = (str) =>
    String(str)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

const formatRef = (ref) =>
    ref
        ? { id: ref._id || ref, name: ref.name || "" }
        : null;

const formatProduct = (p) => ({
    productId: p._id,
    name: p.name || "",
    slug: p.slug || "",
    description: p.description || "",
    thumbnail: p.thumbnail || "",
    images: p.images || [],
    category: formatRef(p.categoryId),
    subCategory: formatRef(p.subCategoryId),
    brand: formatRef(p.brandId),
    attributeValueIds: p.attributeValueIds || [],
    hsnCode: p.hsnCode || "",
    gstPercentage: p.gstPercentage ?? null,
    bulkPricing: (p.bulkPricing || []).map((t) => ({
        minQty: t.minQty,
        price: t.price,
    })),
    warranty: p.warranty || "",
    returnPolicy: p.returnPolicy || "",
    seoTitle: p.seoTitle || "",
    seoDescription: p.seoDescription || "",
    isActive: p.isActive,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
});

// Shared optional-field mapper for create/edit
const applyProductFields = (data, target) => {
    if (data.description !== undefined) target.description = String(data.description);
    if (data.thumbnail !== undefined) target.thumbnail = String(data.thumbnail);
    if (data.images !== undefined) {
        if (!Array.isArray(data.images)) {
            throw new ApiError(400, "images must be an array");
        }
        target.images = data.images.map((i) => String(i));
    }
    if (data.attributeValueIds !== undefined) {
        if (!Array.isArray(data.attributeValueIds)) {
            throw new ApiError(400, "attributeValueIds must be an array");
        }
        data.attributeValueIds.forEach((id) => assertObjectId(id, "attributeValueId"));
        target.attributeValueIds = data.attributeValueIds;
    }
    if (data.hsnCode !== undefined) target.hsnCode = String(data.hsnCode);
    if (data.gstPercentage !== undefined) {
        const gst = Number(data.gstPercentage);
        if (Number.isNaN(gst)) throw new ApiError(400, "gstPercentage must be a number");
        target.gstPercentage = gst;
    }
    if (data.bulkPricing !== undefined) {
        let tiers = data.bulkPricing;
        if (typeof tiers === "string") {
            try {
                tiers = JSON.parse(tiers);
            } catch {
                throw new ApiError(400, "bulkPricing must be a valid JSON array");
            }
        }
        if (!Array.isArray(tiers)) {
            throw new ApiError(400, "bulkPricing must be an array");
        }
        target.bulkPricing = tiers.map((t) => {
            const minQty = Number(t.minQty);
            const price = Number(t.price);
            if (Number.isNaN(minQty) || Number.isNaN(price)) {
                throw new ApiError(400, "Each bulk price needs a numeric minQty and price");
            }
            if (minQty < 1) throw new ApiError(400, "minQty must be at least 1");
            if (price < 0) throw new ApiError(400, "price cannot be negative");
            return { minQty, price };
        });
    }
    if (data.warranty !== undefined) target.warranty = String(data.warranty);
    if (data.returnPolicy !== undefined) target.returnPolicy = String(data.returnPolicy);
    if (data.seoTitle !== undefined) target.seoTitle = String(data.seoTitle);
    if (data.seoDescription !== undefined) {
        target.seoDescription = String(data.seoDescription);
    }
    if (data.isActive !== undefined) {
        if (typeof data.isActive !== "boolean") {
            throw new ApiError(400, "isActive must be a boolean");
        }
        target.isActive = data.isActive;
    }
};

export const displayCategories_Services = async () => {
    const categories = await adminRepo.findActiveCategories();
    return categories.map((c) => ({
        id: c._id,
        name: c.name || "",
        slug: c.slug || "",
    }));
};

export const displayBrands_Services = async () => {
    const brands = await adminRepo.findActiveBrands();
    return brands.map((b) => ({
        id: b._id,
        name: b.name || "",
        slug: b.slug || "",
    }));
};

export const displaySubCategories_Services = async (categoryId) => {
    if (!categoryId) throw new ApiError(400, "categoryId is required");
    assertObjectId(categoryId, "categoryId");

    const subCategories = await adminRepo.findActiveSubCategoriesByCategory(
        categoryId
    );
    return subCategories.map((s) => ({
        id: s._id,
        name: s.name || "",
        slug: s.slug || "",
        categoryId: s.categoryId,
    }));
};

export const displayProducts_Services = async ({
    page,
    limit,
    skip,
    search,
    categoryId,
    brandId,
    isActive,
}) => {
    let activeFilter = null;
    if (
        isActive !== undefined &&
        isActive !== null &&
        String(isActive).trim() !== ""
    ) {
        const value = String(isActive).trim().toLowerCase();
        if (value === "true" || value === "1") activeFilter = true;
        else if (value === "false" || value === "0") activeFilter = false;
        else throw new ApiError(400, "Invalid isActive. Use true or false");
    }

    if (categoryId) assertObjectId(categoryId, "categoryId");
    if (brandId) assertObjectId(brandId, "brandId");

    const { products, total } = await adminRepo.findProductsPaginated({
        skip,
        limit,
        search: search?.trim() || "",
        categoryId: categoryId || null,
        brandId: brandId || null,
        isActive: activeFilter,
    });

    return {
        products: products.map(formatProduct),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 0,
        },
    };
};

const formatProductVendorListing = (l) => {
    const vendor = l.vendorId || {};
    const warehouse = l.warehouseId || {};
    return {
        listingId: l._id,
        vendorId: vendor._id || l.vendorId || null,
        vendorName:
            vendor.businessDetails?.legalBusinessName ||
            vendor.businessDetails?.tradeName ||
            vendor.ownerDetails?.fullName ||
            "Unknown vendor",
        vendorStatus: vendor.status || "",
        warehouse: {
            warehouseId: warehouse._id || l.warehouseId || null,
            name: warehouse.name || "",
            address: warehouse.address || "",
        },
        vendorSku: l.vendorSku || "",
        mrp: l.mrp ?? null,
        sellingPrice: l.sellingPrice ?? null,
        minOrderQuantity: l.minOrderQuantity ?? null,
        stockQuantity: l.stockQuantity ?? 0,
        status: l.status || "",
        createdAt: l.createdAt,
        updatedAt: l.updatedAt,
    };
};

export const displayProductDetails_Services = async (productId) => {
    assertObjectId(productId, "product id");

    const product = await adminRepo.findProductById(productId);
    if (!product) throw new ApiError(404, "Product not found");

    const listings = await adminRepo.findVendorListingsByProduct(productId);
    const vendors = listings.map(formatProductVendorListing);

    const sellingPrices = vendors
        .map((v) => v.sellingPrice)
        .filter((p) => typeof p === "number");

    const summary = {
        vendorCount: new Set(
            vendors.map((v) => String(v.vendorId)).filter(Boolean)
        ).size,
        listingCount: vendors.length,
        totalStock: vendors.reduce((sum, v) => sum + (v.stockQuantity || 0), 0),
        lowestPrice: sellingPrices.length ? Math.min(...sellingPrices) : null,
        highestPrice: sellingPrices.length ? Math.max(...sellingPrices) : null,
    };

    return {
        ...formatProduct(product),
        vendors,
        summary,
    };
};

export const createProduct_Services = async (data) => {
    const name = String(data.name || "").trim();
    if (!name) throw new ApiError(400, "Product name is required");

    if (!data.categoryId) throw new ApiError(400, "categoryId is required");
    assertObjectId(data.categoryId, "categoryId");

    if (!data.brandId) throw new ApiError(400, "brandId is required");
    assertObjectId(data.brandId, "brandId");

    if (data.subCategoryId) assertObjectId(data.subCategoryId, "subCategoryId");

    // Generate slug from provided value or the product name; ensure uniqueness
    let slug = data.slug ? slugify(data.slug) : slugify(name);
    if (!slug) throw new ApiError(400, "Unable to generate a slug from the name");
    const slugExists = await adminRepo.findProductBySlug(slug);
    if (slugExists) slug = `${slug}-${Date.now().toString(36)}`;

    const payload = {
        categoryId: data.categoryId,
        brandId: data.brandId,
        name,
        slug,
    };
    if (data.subCategoryId) payload.subCategoryId = data.subCategoryId;

    applyProductFields(data, payload);

    const created = await adminRepo.createProduct(payload);
    return formatProduct(created);
};

export const editProductDetails_Services = async (productId, data) => {
    assertObjectId(productId, "product id");

    const existing = await adminRepo.findProductById(productId);
    if (!existing) throw new ApiError(404, "Product not found");

    const updateData = {};

    if (data.name !== undefined) {
        const name = String(data.name).trim();
        if (!name) throw new ApiError(400, "Product name cannot be empty");
        updateData.name = name;
    }

    if (data.slug !== undefined) {
        const slug = slugify(data.slug);
        if (!slug) throw new ApiError(400, "Invalid slug");
        const duplicate = await adminRepo.findProductBySlug(slug);
        if (duplicate && String(duplicate._id) !== String(productId)) {
            throw new ApiError(400, "Slug already in use");
        }
        updateData.slug = slug;
    }

    if (data.categoryId !== undefined) {
        assertObjectId(data.categoryId, "categoryId");
        updateData.categoryId = data.categoryId;
    }

    if (data.subCategoryId !== undefined) {
        if (data.subCategoryId) {
            assertObjectId(data.subCategoryId, "subCategoryId");
            updateData.subCategoryId = data.subCategoryId;
        } else {
            updateData.subCategoryId = null;
        }
    }

    if (data.brandId !== undefined) {
        assertObjectId(data.brandId, "brandId");
        updateData.brandId = data.brandId;
    }

    applyProductFields(data, updateData);

    if (Object.keys(updateData).length === 0) {
        throw new ApiError(400, "No fields provided to update");
    }

    const updated = await adminRepo.updateProductById(productId, updateData);
    if (!updated) throw new ApiError(404, "Product not found");
    return formatProduct(updated);
};

export const deleteProduct_Services = async (productId) => {
    assertObjectId(productId, "product id");

    const existing = await adminRepo.findProductById(productId);
    if (!existing) throw new ApiError(404, "Product not found");

    const listings = await adminRepo.findVendorListingsByProduct(productId);
    if (listings.length > 0) {
        throw new ApiError(
            400,
            "Cannot delete product. One or more vendors have listed this product."
        );
    }

    const deleted = await adminRepo.deleteProductById(productId);
    if (!deleted) throw new ApiError(404, "Product not found");
    return true;
};