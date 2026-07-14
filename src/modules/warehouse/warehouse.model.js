import mongoose from "mongoose";

const { Schema, model } = mongoose;

const warehouseSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },

        vendorId: {
            type: Schema.Types.ObjectId,
            ref: "Vendor"
        },

        address: {
            type: String
        },

        capacity: {
            type: String // e.g., "5000 sq ft" or Number
        },

        operatingHours: {
            type: String // e.g., "09:00 AM - 06:00 PM"
        },

        servicedPincodes: [
            {
                type: Schema.Types.ObjectId,
                ref: "Pincode"
            }
        ],

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

export default model("Warehouse", warehouseSchema);