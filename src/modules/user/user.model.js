import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSchema = new Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true
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

        pincode: {
            type: String
        },

        role: {
            type: Schema.Types.ObjectId,
            ref: "Role",
            required: true
        },

        // Onboarding Fields
        persona: {
            type: String,
            enum: ["Contractor", "Builder", "Homeowner", "Architect", null],
            default: null
        },

        companyName: {
            type: String
        },

        gstin: {
            type: String
        },

        sites: [
            {
                siteName: String,
                location: String,
                pincode: String
            }
        ],

        paymentPreference: {
            type: String,
            enum: ["UPI", "Card", "EMI", "COD", null],
            default: null
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