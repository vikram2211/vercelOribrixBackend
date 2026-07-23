import Coupon from "./coupon.model.js";

const notDeleted = { isDelete: { $ne: true } };

export const createCoupon_Repository = async (data) => {
    return await Coupon.create(data);
};

export const findCouponById_Repository = async (id) => {
    return await Coupon.findOne({ _id: id, ...notDeleted });
};

export const findCouponByUniqueId_Repository = async (uniqueId) => {
    return await Coupon.findOne({ uniqueId, ...notDeleted });
};

export const findCouponsPaginated_Repository = async ({
    filter,
    skip,
    limit,
}) => {
    const query = { ...notDeleted, ...filter };

    const [coupons, total] = await Promise.all([
        Coupon.find(query)
            .populate("userId", "fullName email mobile photo")
            .populate({
                path: "reviewedBy",
                select: "fullName email",
                populate: { path: "role", select: "name" },
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Coupon.countDocuments(query),
    ]);

    return { coupons, total };
};

export const findUserCouponsPaginated_Repository = async ({
    userId,
    skip,
    limit,
    search,
    status,
}) => {
    const allowedStatuses = ["accept", "alreadyUsed", "expired"];

    const filter = {
        userId,
        ...notDeleted,
        status: status ? status : { $in: allowedStatuses },
    };

    if (search?.trim()) {
        filter.uniqueId = {
            $regex: search.trim(),
            $options: "i",
        };
    }

    const [coupons, total] = await Promise.all([
        Coupon.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Coupon.countDocuments(filter),
    ]);

    return { coupons, total };
};

export const updateCouponById_Repository = async (id, data) => {
    return await Coupon.findOneAndUpdate(
        { _id: id, ...notDeleted },
        { $set: data },
        { new: true, runValidators: true }
    )
        .populate("userId", "fullName email mobile photo")
        .populate({
            path: "reviewedBy",
            select: "fullName email",
            populate: { path: "role", select: "name" },
        });
};
