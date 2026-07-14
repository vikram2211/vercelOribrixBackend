import crypto from "crypto";
import mongoose from "mongoose";
import ApiError from "../../utils/ApiError.js";
import { COUPON_STATUS } from "./coupon.model.js";
import {
    createCoupon_Repository,
    findCouponById_Repository,
    findCouponByUniqueId_Repository,
    findCouponsPaginated_Repository,
    findUserCouponsPaginated_Repository,
    updateCouponById_Repository,
} from "./coupon.repository.js";

const generateSlug = () =>
    `coupon-${Date.now()}-${Math.round(Math.random() * 1e6)}`;

const generateUniqueId = () =>
    `OBX-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

const parseOptionalNumber = (value, fieldName) => {
    if (value === undefined || value === null || value === "") {
        return undefined;
    }

    const num = Number(value);
    if (Number.isNaN(num)) {
        throw new ApiError(400, `${fieldName} must be a number`);
    }
    return num;
};

const buildOfferFields = ({ amount, percentage }) => {
    const fields = {};

    const parsedAmount = parseOptionalNumber(amount, "amount");
    if (parsedAmount !== undefined) {
        if (parsedAmount < 0) {
            throw new ApiError(400, "amount cannot be negative");
        }
        fields.amount = parsedAmount;
    }

    const parsedPercentage = parseOptionalNumber(percentage, "percentage");
    if (parsedPercentage !== undefined) {
        if (parsedPercentage < 0 || parsedPercentage > 100) {
            throw new ApiError(400, "percentage must be between 0 and 100");
        }
        fields.percentage = parsedPercentage;
    }

    return fields;
};

const ensureUniqueId = async () => {
    let uniqueId;
    let exists = true;

    while (exists) {
        uniqueId = generateUniqueId();
        exists = Boolean(await findCouponByUniqueId_Repository(uniqueId));
    }

    return uniqueId;
};

const formatCoupon = (coupon, { includeUser = true } = {}) => {
    if (!coupon) return null;

    const formatted = {
        id: coupon._id,
        slug: coupon.slug,
        uniqueId: coupon.uniqueId || null,
        img: coupon.img || "",
        amount: coupon.amount ?? null,
        percentage: coupon.percentage ?? null,
        status: coupon.status,
        createdAt: coupon.createdAt,
        updatedAt: coupon.updatedAt,
    };

    if (includeUser) {
        formatted.user =
            coupon.userId && typeof coupon.userId === "object"
                ? {
                      userId: coupon.userId._id,
                      name: coupon.userId.fullName || "",
                      email: coupon.userId.email || "",
                      mobile: coupon.userId.mobile || "",
                      photo: coupon.userId.photo || "",
                  }
                : { userId: coupon.userId };
    }

    return formatted;
};

/** Customer uploads coupon image → status pending */
export const uploadCoupon_Services = async (userId, img) => {
    if (!img) {
        throw new ApiError(400, "Coupon image is required");
    }

    const coupon = await createCoupon_Repository({
        slug: generateSlug(),
        userId,
        img,
        status: "pending",
    });

    return formatCoupon(coupon);
};

/** Admin panel — all non-deleted coupons (optional status / uniqueId search) */
export const getAllCoupons_Services = async ({
    page,
    limit,
    skip,
    status,
    search,
}) => {
    const filter = {};

    if (status?.trim()) {
        const value = status.trim();
        if (!COUPON_STATUS.includes(value)) {
            throw new ApiError(
                400,
                `Invalid status. Use: ${COUPON_STATUS.join(", ")}`
            );
        }
        filter.status = value;
    }

    if (search?.trim()) {
        filter.uniqueId = {
            $regex: search.trim(),
            $options: "i",
        };
    }

    const { coupons, total } = await findCouponsPaginated_Repository({
        filter,
        skip,
        limit,
    });

    return {
        coupons: coupons.map(formatCoupon),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 0,
        },
    };
};

const USER_VISIBLE_STATUSES = ["accept", "alreadyUsed", "expired"];

/**
 * Customer view — accept / alreadyUsed / expired only.
 * Supports pagination, uniqueId search, and status filter.
 */
export const getCouponsForUser_Services = async ({
    userId,
    page,
    limit,
    skip,
    search,
    status,
}) => {
    let statusFilter;

    if (status?.trim()) {
        const value = status.trim();
        if (!USER_VISIBLE_STATUSES.includes(value)) {
            throw new ApiError(
                400,
                `Invalid status. Use: ${USER_VISIBLE_STATUSES.join(", ")}`
            );
        }
        statusFilter = value;
    }

    const { coupons, total } = await findUserCouponsPaginated_Repository({
        userId,
        skip,
        limit,
        search,
        status: statusFilter,
    });

    return {
        coupons: coupons.map((coupon) =>
            formatCoupon(coupon, { includeUser: false })
        ),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 0,
        },
    };
};

/**
 * Admin update — status and/or amount / percentage.
 * On accept, generate uniqueId once (if missing).
 */
export const updateCouponStatus_Services = async (
    id,
    { status, amount, percentage }
) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid coupon id");
    }

    const hasStatus = status !== undefined && status !== null && status !== "";
    const hasAmount = amount !== undefined && amount !== null && amount !== "";
    const hasPercentage =
        percentage !== undefined && percentage !== null && percentage !== "";

    if (!hasStatus && !hasAmount && !hasPercentage) {
        throw new ApiError(
            400,
            "Provide at least one of: status, amount, percentage"
        );
    }

    if (hasStatus && !COUPON_STATUS.includes(status)) {
        throw new ApiError(
            400,
            `Invalid status. Use: ${COUPON_STATUS.join(", ")}`
        );
    }

    const coupon = await findCouponById_Repository(id);
    if (!coupon) {
        throw new ApiError(404, "Coupon not found");
    }

    const updateData = {
        ...buildOfferFields({
            amount: hasAmount ? amount : undefined,
            percentage: hasPercentage ? percentage : undefined,
        }),
    };

    if (hasStatus) {
        updateData.status = status;

        if (status === "accept" && !coupon.uniqueId) {
            updateData.uniqueId = await ensureUniqueId();
        }
    }

    const updated = await updateCouponById_Repository(id, updateData);
    return formatCoupon(updated);
};
