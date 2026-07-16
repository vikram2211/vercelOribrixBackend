import ApiError from "../../utils/ApiError.js";
import * as adminRepo from "./admin.repository.js";

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