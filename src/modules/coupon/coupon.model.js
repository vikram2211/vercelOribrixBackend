import mongoose from "mongoose";

const { Schema, model } = mongoose;

export const COUPON_STATUS = [
    "pending",
    "accept",
    "reject",
    "alreadyUsed",
    "expired",
];

const couponSchema = new Schema(
    {
        slug: {
            type: String,
            unique: true,
            trim: true,
        },
        uniqueId: {
            type: String,
            unique: true,
            sparse: true,
            trim: true,
            uppercase: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        img: {
            type: String,
            default: "",
        },
        amount: {
            type: Number,
            default: null,
            min: 0,
        },
        percentage: {
            type: Number,
            default: null,
            min: 0,
            max: 100,
        },
        status: {
            type: String,
            enum: COUPON_STATUS,
            default: "pending",
        },
        /** Admin / Sub-admin who last reviewed (approve / reject / etc.) */
        reviewedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        reviewedAt: {
            type: Date,
            default: null,
        },
        isDelete: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

couponSchema.index({ userId: 1, isDelete: 1, status: 1 });

export default model("Coupon", couponSchema);
