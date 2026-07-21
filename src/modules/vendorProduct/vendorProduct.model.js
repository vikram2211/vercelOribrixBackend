import mongoose from "mongoose";

const { Schema, model } = mongoose;

const vendorProductSchema = new Schema(
    {
        vendorId: {
            type: Schema.Types.ObjectId,
            ref: "Vendor",
            required: true
        },
        productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        warehouseId: {
            type: Schema.Types.ObjectId,
            ref: "Warehouse", // Assuming you'll create a standalone Warehouse model soon
            required: false   // Make true once Warehouse module is fully ready
        },

        mrp: {
            type: Number,
            required: true,
            min: 0
        },
        priceType: {
            type: String,
            enum: ["Inclusive of GST", "Exclusive of GST"],
            default: "Exclusive of GST"
        },
        sellingPrice: {
            type: Number,
            required: true,
            min: 0
        },
        minOrderQuantity: {
            type: Number,
            default: 1,
            min: 1
        },
        warranty: {
            type: String
        },
        returnPolicy: {
            type: String
        },
        isCodAvailable: {
            type: Boolean,
            default: false
        },
        stockQuantity: {
            type: Number,
            required: true,
            default: 0,
            min: 0
        },
        status: {
            type: String,
            enum: ["ACTIVE", "OUT_OF_STOCK", "PAUSED"],
            default: "ACTIVE"
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

// Pre-calculate total stock logic can be applied here later

// Crucial: A vendor can list the exact same master product multiple times, 
// BUT ONLY IF it is located in a different warehouse!
vendorProductSchema.index({ vendorId: 1, productId: 1, warehouseId: 1 }, { unique: true });

export default model("VendorProduct", vendorProductSchema);
