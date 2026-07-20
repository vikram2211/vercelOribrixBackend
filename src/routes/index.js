import express from "express";
const router = express.Router();

import authRoutes from "../modules/auth/auth.routes.js";
import vendorRoutes from "../modules/vendor/vendor.routes.js";
import customerRouter from "../modules/customerProfile/customerProfile.routes.js";
import categoryRoutes from "../modules/category/category.routes.js";
import subCategoryRoutes from "../modules/subCategory/subCategory.routes.js";
import productRoutes from "../modules/product/product.routes.js";
import kycRoutes from "../modules/kyc/kyc.routes.js";
import couponRouter from "../modules/coupon/coupon.routes.js";
import adminRouter from "../modules/admin/admin.routes.js";

import cartRoutes from "../modules/cart/cart.routes.js";

// Import routes from modules here as you build them
router.use("/auth", authRoutes);
router.use("/v1/cart", cartRoutes);
router.use("/vendor", vendorRoutes);
router.use("/customer", customerRouter);
router.use("/product", categoryRoutes);
router.use("/kyc", kycRoutes);
router.use("/coupon", couponRouter);
// Catalog Routes
router.use("/v1/sub-category", subCategoryRoutes);
router.use("/product", productRoutes);

import unitRoutes from "../modules/unit/unit.routes.js";
router.use("/v1/units", unitRoutes);

// Brand & Attribute Routes
import brandRoutes from "../modules/brand/brand.routes.js";
import attributeRoutes from "../modules/attribute/attribute.routes.js";
router.use("/v1/brands", brandRoutes);
router.use("/v1/attributes", attributeRoutes);

router.use("/admin", adminRouter);

// Vendor Inventory & Logistics Routes
import vendorProductRoutes from "../modules/vendorProduct/vendorProduct.routes.js";
import warehouseRoutes from "../modules/warehouse/warehouse.routes.js";

// Mobile App Aggregation Routes
import homeRoutes from "../modules/home/home.routes.js";

router.use("/v1/vendor-product", vendorProductRoutes);
router.use("/warehouse", warehouseRoutes);
router.use("/v1/mobile/home", homeRoutes);

export default router;