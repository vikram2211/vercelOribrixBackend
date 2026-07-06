import express from "express";
const router = express.Router();

import authRoutes from "../modules/auth/auth.routes.js";
import vendorRoutes from "../modules/vendor/vendor.routes.js";

// Import routes from modules here as you build them
router.use("/auth", authRoutes);
router.use("/vendor", vendorRoutes);

export default router;
