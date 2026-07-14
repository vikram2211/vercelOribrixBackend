import asyncHandler from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/response.js";
import pagination from "../../utils/pagination.js";
import {
    getAllCoupons_Services,
    getCouponsForUser_Services,
    updateCouponStatus_Services,
    uploadCoupon_Services,
} from "./coupon.services.js";

export const uploadCoupon = asyncHandler(async (req, res) => {
    const img = req.file?.path || "";
    const coupon = await uploadCoupon_Services(req.user.userId, img);
    return sendResponse(res, 201, "Coupon image uploaded successfully", coupon);
});

export const getAllCoupons = asyncHandler(async (req, res) => {
    const { page, limit, skip } = pagination(req.query);
    const result = await getAllCoupons_Services({
        page,
        limit,
        skip,
        status: req.query.status,
        search: req.query.search,
    });
    return sendResponse(res, 200, "Coupons fetched successfully", result);
});

export const getCouponsForUser = asyncHandler(async (req, res) => {
    const { page, limit, skip } = pagination(req.query);
    const result = await getCouponsForUser_Services({
        userId: req.user.userId,
        page,
        limit,
        skip,
        search: req.query.search,
        status: req.query.status,
    });
    return sendResponse(res, 200, "Coupons fetched successfully", result);
});

export const updateCouponStatus = asyncHandler(async (req, res) => {
    const coupon = await updateCouponStatus_Services(req.params.id, {
        status: req.body.status,
        amount: req.body.amount,
        percentage: req.body.percentage,
    });
    return sendResponse(res, 200, "Coupon updated successfully", coupon);
});
