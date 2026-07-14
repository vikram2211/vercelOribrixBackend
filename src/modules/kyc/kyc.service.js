import ApiError from "../../utils/ApiError.js";
import {
    findVendorKYCById_Repository,
    findVendorsKYCPaginated_Repository,
    updateVendorKYCDocuments_Repository,
} from "./kyc.repository.js";
import { DOC_KEYS } from "./kyc.validation.js";

const formatDocument = (doc) => ({
    fileUrl: doc?.fileUrl || "",
    status: doc?.status || "PENDING",
    remarks: doc?.remarks || "",
});

const formatKycDocuments = (kycDocuments = {}) =>
    Object.fromEntries(
        DOC_KEYS.map((key) => [key, formatDocument(kycDocuments[key])])
    );

/**
 * pending     — every document is PENDING
 * approved    — every document is APPROVED
 * rejected    — every document is REJECTED
 * underReview — any mix (one approved / one rejected / received / re-upload, etc.)
 */
export const computeDocumentStatus = (kycDocuments = {}) => {
    const statuses = DOC_KEYS.map(
        (key) => kycDocuments?.[key]?.status || "PENDING"
    );

    const allApproved = statuses.every((s) => s === "APPROVED");
    if (allApproved) return "approved";

    const allRejected = statuses.every((s) => s === "REJECTED");
    if (allRejected) return "rejected";

    const allPending = statuses.every((s) => s === "PENDING");
    if (allPending) return "pending";

    return "underReview";
};

/**
 * Maps document status → vendor.status
 * approved  → APPROVED
 * rejected  → REJECTED
 * otherwise → PENDING_VERIFICATION
 * (SUSPENDED is never auto-set here)
 */
export const computeVendorStatus = (kycDocuments = {}) => {
    const documentStatus = computeDocumentStatus(kycDocuments);

    if (documentStatus === "approved") return "APPROVED";
    if (documentStatus === "rejected") return "REJECTED";
    return "PENDING_VERIFICATION";
};

const normalizeStatusFilter = (status) => {
    if (!status?.trim()) return null;

    const value = status.trim().toLowerCase();
    const map = {
        pending: "pending",
        underreview: "underReview",
        "under-review": "underReview",
        under_review: "underReview",
        approved: "approved",
        rejected: "rejected",
    };

    const normalized = map[value];
    if (!normalized) {
        throw new ApiError(
            400,
            "Invalid status. Use pending, underReview, approved, or rejected"
        );
    }
    return normalized;
};

const formatVendorFullDetails = (vendor) => ({
    vendorId: vendor._id,
    name: vendor.ownerDetails?.fullName || "",
    email: vendor.ownerDetails?.email || "",
    mobile: vendor.ownerDetails?.mobile || "",
    ownerDetails: {
        fullName: vendor.ownerDetails?.fullName || "",
        email: vendor.ownerDetails?.email || "",
        mobile: vendor.ownerDetails?.mobile || "",
        designation: vendor.ownerDetails?.designation || "",
        ownerAadhaar: vendor.ownerDetails?.ownerAadhaar || "",
        ownerPan: vendor.ownerDetails?.ownerPan || "",
    },
    businessDetails: vendor.businessDetails || {},
    bankDetails: vendor.bankDetails || {},
    warehouseDetails: vendor.warehouseDetails || {},
    productCategories: (vendor.productCategories || []).map((cat) => ({
        categoryId: cat._id,
        name: cat.name,
    })),
    kycDocuments: formatKycDocuments(vendor.kycDocuments),
    documentStatus: computeDocumentStatus(vendor.kycDocuments),
    status: vendor.status,
    createdAt: vendor.createdAt,
    updatedAt: vendor.updatedAt,
});

export const displayAllKYC_Vender_Services = async ({
    page,
    limit,
    skip,
    search,
    status,
}) => {
    const statusFilter = normalizeStatusFilter(status);

    const { vendors, total } = await findVendorsKYCPaginated_Repository({
        skip,
        limit,
        search: search?.trim() || "",
        status: statusFilter,
    });

    const formatted = vendors.map((vendor) => ({
        vendorId: vendor._id,
        name: vendor.ownerDetails?.fullName || "",
        email: vendor.ownerDetails?.email || "",
        mobile: vendor.ownerDetails?.mobile || "",
        documentStatus: computeDocumentStatus(vendor.kycDocuments),
    }));

    return {
        vendors: formatted,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 0,
        },
    };
};

export const displayKYC_Vender_fullDetails_Services = async (vendorId) => {
    const vendor = await findVendorKYCById_Repository(vendorId);

    if (!vendor) {
        throw new ApiError(404, "Vendor not found");
    }

    return formatVendorFullDetails(vendor);
};

export const documentVerification_Services = async (vendorId, documents) => {
    const vendor = await findVendorKYCById_Repository(vendorId);

    if (!vendor) {
        throw new ApiError(404, "Vendor not found");
    }

    const updateData = {};
    const mergedDocs = { ...(vendor.kycDocuments || {}) };

    for (const [key, payload] of Object.entries(documents)) {
        if (!DOC_KEYS.includes(key)) {
            throw new ApiError(400, `Invalid document key: ${key}`);
        }

        const existing = mergedDocs[key] || {};
        const updatedDoc = {
            fileUrl: existing.fileUrl || "",
            status: payload.status,
            remarks:
                payload.remarks !== undefined
                    ? payload.remarks
                    : existing.remarks || "",
        };

        mergedDocs[key] = updatedDoc;
        updateData[`kycDocuments.${key}`] = updatedDoc;
    }

    updateData.status = computeVendorStatus(mergedDocs);

    const updatedVendor = await updateVendorKYCDocuments_Repository(
        vendorId,
        updateData
    );

    if (!updatedVendor) {
        throw new ApiError(404, "Vendor not found");
    }

    return formatVendorFullDetails(updatedVendor);
};
