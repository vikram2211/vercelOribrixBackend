import mongoose from "mongoose";

const { Schema, model } = mongoose;

const kycDocumentSchema = new Schema({
    fileUrl: String,
    status: {
        type: String,
        enum: ["PENDING", "RECEIVED", "APPROVED", "RE-UPLOAD_REQUESTED", "REJECTED"],
        default: "PENDING"
    },
    remarks: String
});

const vendorSchema = new Schema(
    {
        ownerId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        legalBusinessName: {
            type: String,
            required: true
        },

        tradeName: {
            type: String,
            required: true
        },

        gstin: {
            type: String,
            required: true
        },

        pan: {
            type: String,
            required: true
        },

        warehouseAddress: {
            type: String,
            required: true
        },

        pincode: {
            type: String,
            required: true
        },

        kycDocuments: {
            gstCert: kycDocumentSchema,
            panCard: kycDocumentSchema,
            cancelledCheque: kycDocumentSchema,
            msmeUdyam: kycDocumentSchema
        },

        status: {
            type: String,
            enum: ["PENDING_VERIFICATION", "APPROVED", "REJECTED", "SUSPENDED"],
            default: "PENDING_VERIFICATION"
        }
    },
    {
        timestamps: true
    }
);

export default model("Vendor", vendorSchema);
