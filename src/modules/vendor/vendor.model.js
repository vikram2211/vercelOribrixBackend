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

        businessDetails: {
            legalBusinessName: { type: String, required: true },
            entityType: { type: String, required: true },
            tradeName: { type: String },
            gstin: { type: String, required: true },
            pan: { type: String, required: true },
            cin: { type: String },
            yearEstablished: { type: String },
            registeredAddress: { type: String, required: true }
        },

        ownerDetails: {
            fullName: { type: String, required: true },
            email: { type: String, required: true },
            mobile: { type: String, required: true },
            designation: { type: String, required: true },
            ownerAadhaar: { type: String, required: true },
            ownerPan: { type: String, required: true }
        },

        bankDetails: {
            accountHolder: { type: String, required: true },
            bankName: { type: String, required: true },
            accountNumber: { type: String, required: true },
            ifsc: { type: String, required: true },
            branch: { type: String, required: true },
            accountType: { type: String, required: true }
        },

        warehouseDetails: {
            warehouseName: { type: String, required: true },
            storageCapacity: { type: String, required: true },
            latitude: { type: String },
            longitude: { type: String },
            operatingHours: { type: String },
            vehicleAccess: { type: String },
            address: { type: String, required: true }
        },

        productCategories: [{
            type: Schema.Types.ObjectId,
            ref: "Category"
        }],

        kycDocuments: {
            gstCert: kycDocumentSchema,
            panCard: kycDocumentSchema,
            cancelledCheque: kycDocumentSchema,
            msmeUdyam: kycDocumentSchema,
            shopAndTradeLicense: kycDocumentSchema,
            ownerAadhaarDoc: kycDocumentSchema,
            oribrixSellerAgreement: kycDocumentSchema,
            iso9001: kycDocumentSchema
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
