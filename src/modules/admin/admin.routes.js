import express from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import { uploadProduct } from "../../middleware/upload.middleware.js";
import {
    createPermission,
    createProduct,
    createSubAdmin,
    deleteCustomer,
    deletePermission,
    deleteProduct,
    deleteSubAdmin,
    deleteVendor,
    displayAdminProfile,
    displayAllWarehousesByVendor,
    displayBrands,
    displayCategories,
    displayCustomerDetails,
    displayCustomers,
    displayPermissions,
    displayProductDetails,
    displayProducts,
    displaySubAdminDetails,
    displaySubAdmins,
    displaySubCategories,
    displayVendorDetails,
    displayVendors,
    displayVendorsApplication,
    editAdminProfile,
    editCustomerDetails,
    editPermission,
    editProductDetails,
    editSubAdminDetails,
    editVendorDetails,
} from "./admin.controller.js";

const router = express.Router();
export const AdminPermissions = {
    ADMIN: "ADMIN",
    SUB_ADMIN: "SUB_ADMIN",
};

router.get("/v1/admin/profile", authenticate, authorize(AdminPermissions), displayAdminProfile);
router.patch("/v1/admin/profile", authenticate, authorize(AdminPermissions), editAdminProfile);

// vendor routes ==================
router.get(
    "/v1/vendors",
    authenticate,
    authorize(AdminPermissions),
    displayVendors
);
router.get(
    "/v1/vendors-applay",
    authenticate,
    authorize(AdminPermissions),
    displayVendorsApplication
);
router.get(
    "/v1/vendor/:id",
    authenticate,
    authorize(AdminPermissions),
    displayVendorDetails
);
router.patch(
    "/v1/vendor/:id",
    authenticate,
    authorize(AdminPermissions),
    editVendorDetails
);
router.delete(
    "/v1/vendor/:id",
    authenticate,
    authorize(AdminPermissions),
    deleteVendor
);

// warehouse routes ==================
router.get(
    "/v1/vendor/:vendorId/warehouses",
    authenticate,
    authorize(AdminPermissions),
    displayAllWarehousesByVendor
);

// customer routes ==================
router.get(
    "/v1/customers",
    authenticate,
    authorize(AdminPermissions),
    displayCustomers
);
router.get(
    "/v1/customer/:id",
    authenticate,
    authorize(AdminPermissions),
    displayCustomerDetails
);
router.patch(
    "/v1/customer/:id",
    authenticate,
    authorize(AdminPermissions),
    editCustomerDetails
);
router.delete(
    "/v1/customer/:id",
    authenticate,
    authorize(AdminPermissions),
    deleteCustomer
);

// sub admin routes ==================
router.post("/v1/sub-admin", authenticate, authorize("ADMIN"), createSubAdmin);
router.get("/v1/sub-admins", authenticate, authorize("ADMIN"), displaySubAdmins);
router.get("/v1/sub-admin/:id", authenticate, authorize("ADMIN"), displaySubAdminDetails);
router.patch("/v1/sub-admin/:id", authenticate, authorize("ADMIN"), editSubAdminDetails);
router.delete("/v1/sub-admin/:id", authenticate, authorize("ADMIN"), deleteSubAdmin);


// permissionsRoutes ==================
router.get("/v1/permissions", authenticate, authorize("ADMIN"), displayPermissions);
router.post("/v1/permission", authenticate, authorize("ADMIN"), createPermission);
router.patch("/v1/permission/:id", authenticate, authorize("ADMIN"), editPermission);
router.delete("/v1/permission/:id", authenticate, authorize("ADMIN"), deletePermission);


// catalog lookup routes ==================
router.get("/v1/categories", authenticate, authorize(AdminPermissions), displayCategories);
router.get("/v1/brands", authenticate, authorize(AdminPermissions), displayBrands);
router.get("/v1/sub-categories", authenticate, authorize(AdminPermissions), displaySubCategories);

// productRoutes ==================
router.get("/v1/products", authenticate, authorize(AdminPermissions), displayProducts);
router.get("/v1/product/:id", authenticate, authorize(AdminPermissions), displayProductDetails);
router.post(
    "/v1/product",
    authenticate,
    authorize("ADMIN"),
    uploadProduct.fields([
        { name: "thumbnail", maxCount: 1 },
        { name: "images", maxCount: 10 },
    ]),
    createProduct
);
router.patch(
    "/v1/product/:id",
    authenticate,
    authorize("ADMIN"),
    uploadProduct.fields([
        { name: "thumbnail", maxCount: 1 },
        { name: "images", maxCount: 10 },
    ]),
    editProductDetails
);
router.delete("/v1/product/:id", authenticate, authorize("ADMIN"), deleteProduct);


export default router;