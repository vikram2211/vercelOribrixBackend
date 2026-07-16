import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSchema = new Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true
        },

        photo: {
            type: String,
            default: ""
        },

        myReferralCode: {
            type: String,
            unique: true,
            sparse: true
        },

        referredBy: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },

        walletBalance: {
            type: Number,
            default: 0
        },

        referralStats: {
            totalSignups: { type: Number, default: 0 },
            successfulReferrals: { type: Number, default: 0 },
            totalEarned: { type: Number, default: 0 }
        },

        email: {
            type: String,
            unique: true,
            sparse: true,
            lowercase: true
        },

        mobile: {
            type: String,
            unique: true,
            sparse: true
        },

        password: {
            type: String
        },

        // Home / delivery area pincode — collected at registration
        pincode: {
            type: String
        },

        role: {
            type: Schema.Types.ObjectId,
            ref: "Role",
            required: true
        },

        // OTP Fields
        otp: {
            type: String
        },

        otpExpiry: {
            type: Date
        },

        isVerified: {
            type: Boolean,
            default: false
        },

        isActive: {
            type: Boolean,
            default: true
        },

        lastLogin: {
            type: Date
        },

        // 2FA Fields
        is2FAEnabled: {
            type: Boolean,
            default: false
        },

        twoFactorSecret: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

export default model("User", userSchema);