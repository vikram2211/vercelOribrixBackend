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