import asyncHandler from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/response.js";
import pagination from "../../utils/pagination.js";
import {
    createPermission_Services,
    createProduct_Services,
    createSubAdmin_Services,
    deleteCustomer_Services,
    deletePermission_Services,
    deleteProduct_Services,
    deleteSubAdmin_Services,
    deleteVendor_Services,
    displayAllWarehousesByVendor_Services,
    displayCustomerDetails_Services,
    displayCustomers_Services,
    displayPermissions_Services,
    displayProductDetails_Services,
    displayProducts_Services,
    displaySubAdminDetails_Services,
    displaySubAdmins_Services,
    displayVendorDetails_Services,
    displayVendorsApplication_Services,
    displayVendors_Services,
    editCustomerDetails_Services,
    editPermission_Services,
    editProductDetails_Services,
    editSubAdminDetails_Services,
    editVendorDetails_Services,
} from "./admin.service.js";

// ─── Vendor ───────────────────────────────────────────────

export const displayVendors = asyncHandler(async (req, res) => {
    const { page, limit, skip } = pagination(req.query);
    const { search, status } = req.query;

    const result = await displayVendors_Services({
        page,
        limit,
        skip,
        search,
        status,
    });

    return sendResponse(res, 200, "Vendors fetched successfully", result);
});

export const displayVendorsApplication = asyncHandler(async (req, res) => {
    const { page, limit, skip } = pagination(req.query);
    const { search } = req.query;

    const result = await displayVendorsApplication_Services({
        page,
        limit,
        skip,
        search,
    });

    return sendResponse(
        res,
        200,
        "Vendor applications fetched successfully",
        result
    );
});

export const displayVendorDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await displayVendorDetails_Services(id);

    return sendResponse(res, 200, "Vendor details fetched successfully", result);
});

export const editVendorDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await editVendorDetails_Services(id, req.body);

    return sendResponse(res, 200, "Vendor updated successfully", result);
});

export const deleteVendor = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await deleteVendor_Services(id);

    return sendResponse(res, 200, "Vendor deleted successfully");
});

// ─── Warehouse ────────────────────────────────────────────

export const displayAllWarehousesByVendor = asyncHandler(async (req, res) => {
    const { vendorId } = req.params;
    const result = await displayAllWarehousesByVendor_Services(vendorId);

    return sendResponse(res, 200, "Warehouses fetched successfully", result);
});

// ─── Customer ─────────────────────────────────────────────

export const displayCustomers = asyncHandler(async (req, res) => {
    const { page, limit, skip } = pagination(req.query);
    const { search, name, email, phone, mobile, pincode, isActive } = req.query;

    const result = await displayCustomers_Services({
        page,
        limit,
        skip,
        search,
        name,
        email,
        phone: phone || mobile,
        pincode,
        isActive,
    });

    return sendResponse(res, 200, "Customers fetched successfully", result);
});

export const displayCustomerDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await displayCustomerDetails_Services(id);

    return sendResponse(
        res,
        200,
        "Customer details fetched successfully",
        result
    );
});

export const editCustomerDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await editCustomerDetails_Services(id, req.body);

    return sendResponse(res, 200, "Customer updated successfully", result);
});

export const deleteCustomer = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await deleteCustomer_Services(id);

    return sendResponse(res, 200, "Customer deleted successfully");
});

// ─── Sub Admin ────────────────────────────────────────────

export const createSubAdmin = asyncHandler(async (req, res) => {
    const result = await createSubAdmin_Services(req.body);

    return sendResponse(res, 201, "Sub admin created successfully", result);
});

export const displaySubAdmins = asyncHandler(async (req, res) => {
    const { page, limit, skip } = pagination(req.query);
    const { search, isActive } = req.query;

    const result = await displaySubAdmins_Services({
        page,
        limit,
        skip,
        search,
        isActive,
    });

    return sendResponse(res, 200, "Sub admins fetched successfully", result);
});

export const displaySubAdminDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await displaySubAdminDetails_Services(id);

    return sendResponse(
        res,
        200,
        "Sub admin details fetched successfully",
        result
    );
});

export const editSubAdminDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await editSubAdminDetails_Services(id, req.body);

    return sendResponse(res, 200, "Sub admin updated successfully", result);
});

export const deleteSubAdmin = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await deleteSubAdmin_Services(id);

    return sendResponse(res, 200, "Sub admin deleted successfully");
});

// ─── Permissions ──────────────────────────────────────────

export const displayPermissions = asyncHandler(async (req, res) => {
    const result = await displayPermissions_Services();

    return sendResponse(res, 200, "Permissions fetched successfully", result);
});

export const createPermission = asyncHandler(async (req, res) => {
    const result = await createPermission_Services(req.body);

    return sendResponse(res, 201, "Permission created successfully", result);
});

export const editPermission = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await editPermission_Services(id, req.body);

    return sendResponse(res, 200, "Permission updated successfully", result);
});

export const deletePermission = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await deletePermission_Services(id);

    return sendResponse(res, 200, "Permission deleted successfully");
});

// ─── Products ─────────────────────────────────────────────

export const displayProducts = asyncHandler(async (req, res) => {
    const { page, limit, skip } = pagination(req.query);
    const { search, categoryId, brandId, isActive } = req.query;

    const result = await displayProducts_Services({
        page,
        limit,
        skip,
        search,
        categoryId,
        brandId,
        isActive,
    });

    return sendResponse(res, 200, "Products fetched successfully", result);
});

export const displayProductDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await displayProductDetails_Services(id);

    return sendResponse(
        res,
        200,
        "Product details fetched successfully",
        result
    );
});

export const createProduct = asyncHandler(async (req, res) => {
    const result = await createProduct_Services(req.body);

    return sendResponse(res, 201, "Product created successfully", result);
});

export const editProductDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = { ...req.body };

    // multipart/form-data sends booleans as strings
    if (typeof data.isActive === "string") {
        data.isActive = data.isActive === "true";
    }

    // Newly uploaded thumbnail (Cloudinary URL) replaces the existing one
    if (req.files?.thumbnail?.[0]) {
        data.thumbnail = req.files.thumbnail[0].path;
    }

    // Merge kept existing images with any newly uploaded ones
    if (data.existingImages !== undefined || req.files?.images?.length) {
        let kept = [];
        if (data.existingImages !== undefined) {
            try {
                kept = JSON.parse(data.existingImages);
            } catch {
                kept = Array.isArray(data.existingImages)
                    ? data.existingImages
                    : [data.existingImages];
            }
        }
        const uploaded = (req.files?.images || []).map((f) => f.path);
        data.images = [...(Array.isArray(kept) ? kept : []), ...uploaded];
    }
    delete data.existingImages;

    const result = await editProductDetails_Services(id, data);

    return sendResponse(res, 200, "Product updated successfully", result);
});

export const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await deleteProduct_Services(id);

    return sendResponse(res, 200, "Product deleted successfully");
});