import asyncHandler from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/response.js";
import pagination from "../../utils/pagination.js";
import {
    deleteCustomer_Services,
    deleteVendor_Services,
    displayAllWarehousesByVendor_Services,
    displayCustomerDetails_Services,
    displayCustomers_Services,
    displayVendorDetails_Services,
    displayVendors_Services,
    editCustomerDetails_Services,
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