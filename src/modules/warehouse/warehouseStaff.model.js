import mongoose from "mongoose";

const { Schema, model } = mongoose;

const warehouseStaffSchema = new Schema(
    {
        warehouseId: {
            type: Schema.Types.ObjectId,
            ref: "Warehouse",
            required: true
        },
        vendorId: {
            type: Schema.Types.ObjectId,
            ref: "Vendor",
            required: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        phone: {
            type: String,
            trim: true
        },
        email: {
            type: String,
            trim: true,
            lowercase: true
        },
        jobRole: {
            type: String,
            trim: true
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

export default model("WarehouseStaff", warehouseStaffSchema);
