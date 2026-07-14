import express from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import { uploadCoupon as uploadCouponMiddleware } from "../../middleware/upload.middleware.js";
import {
    getAllCoupons,
    getCouponsForUser,
    updateCouponStatus,
    uploadCoupon,
} from "./coupon.controller.js";

const router = express.Router();

// Customer — upload coupon image (saved as pending)
router.post(
    "/v1/upload",
    authenticate,
    authorize("CUSTOMER"),
    uploadCouponMiddleware.single("img"),
    uploadCoupon
);

// Admin — list all uploaded coupons (optional ?status=pending)
router.get("/v1", authenticate, authorize("ADMIN"), getAllCoupons);

// Customer — accepted / alreadyUsed / expired (reject & deleted hidden)
router.get(
    "/v1/approved",
    authenticate,
    authorize("CUSTOMER"),
    getCouponsForUser
);

// Admin — approve / reject / mark alreadyUsed / expired
router.patch(
    "/v1/:id",
    authenticate,
    authorize("ADMIN"),
    updateCouponStatus
);

export default router;
