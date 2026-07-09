import mongoose from "mongoose";

const { Schema, model } = mongoose;

// Sub-schema for each construction site
const siteSchema = new Schema(
    {
        siteName: {
            type: String,
            required: true,
            trim: true
        },
        siteAddress: {
            type: String,
            required: true,
            trim: true
        },
        pincode: {
            type: String,
            required: true,
            match: /^[0-9]{6}$/
        }
    },
    { _id: true }
);

const customerProfileSchema = new Schema(
    {
        // Links back to the User (auth identity)
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        // Step 1 — Who are you?
        persona: {
            type: String,
            enum: ["Contractor", "Builder", "Homeowner", "Architect"],
            required: true
        },

        // Company details (optional for Homeowner)
        companyName: {
            type: String,
            trim: true
        },

        gstin: {
            type: String,
            trim: true,
            uppercase: true
        },

        // Multiple construction sites
        sites: [siteSchema],

        // Team invite — single mobile or email input
        teamInvites: {
            type: String,
            trim: true
        },

        // Customer's preferred payment modes (multi-select)
        paymentPreferences: [
            {
                type: String,
                enum: ["UPI", "Card", "EMI via PG", "COD"]
            }
        ],

        // Flag: true once C02 onboarding wizard is fully submitted
        onboardingComplete: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

export default model("CustomerProfile", customerProfileSchema);
