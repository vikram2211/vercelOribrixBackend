import express from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import {
    deleteCustomer,
    deleteVendor,
    displayAllWarehousesByVendor,
    displayCustomerDetails,
    displayCustomers,
    displayVendorDetails,
    displayVendors,
    editCustomerDetails,
    editVendorDetails,
} from "./admin.controller.js";

const router = express.Router();

// vendor routes ==================
router.get(
    "/v1/vendors",
    authenticate,
    authorize("ADMIN"),
    displayVendors
);
router.get(
    "/v1/vendor/:id",
    authenticate,
    authorize("ADMIN"),
    displayVendorDetails
);
router.patch(
    "/v1/vendor/:id",
    authenticate,
    authorize("ADMIN"),
    editVendorDetails
);
router.delete(
    "/v1/vendor/:id",
    authenticate,
    authorize("ADMIN"),
    deleteVendor
);

// warehouse routes ==================
router.get(
    "/v1/vendor/:vendorId/warehouses",
    authenticate,
    authorize("ADMIN"),
    displayAllWarehousesByVendor
);

// customer routes ==================
router.get(
    "/v1/customers",
    authenticate,
    authorize("ADMIN"),
    displayCustomers
);
router.get(
    "/v1/customer/:id",
    authenticate,
    authorize("ADMIN"),
    displayCustomerDetails
);
router.patch(
    "/v1/customer/:id",
    authenticate,
    authorize("ADMIN"),
    editCustomerDetails
);
router.delete(
    "/v1/customer/:id",
    authenticate,
    authorize("ADMIN"),
    deleteCustomer
);

export default router;