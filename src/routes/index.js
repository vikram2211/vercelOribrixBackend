import express from "express";
const router = express.Router();

import authRoutes from "../modules/auth/auth.routes.js";
import vendorRoutes from "../modules/vendor/vendor.routes.js";
import customerRouter from "../modules/customerProfile/customerProfile.routes.js";
import categoryRoutes from "../modules/category/category.routes.js";

// Import routes from modules here as you build them
router.use("/auth", authRoutes);
router.use("/vendor", vendorRoutes);
router.use("/customer", customerRouter);
router.use("/product", categoryRoutes);

export default router;
