import express from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import { AdminPermissions } from "../admin/admin.permissions.js";
import { uploadCoupon as uploadCouponMiddleware } from "../../middleware/upload.middleware.js";
import {
    getCouponsForUser,
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


// Customer — accepted / alreadyUsed / expired (reject & deleted hidden)
router.get(
    "/v1/approved",
    authenticate,
    authorize("CUSTOMER"),
    getCouponsForUser
);



export default router;
