import Joi from "joi";

const DOC_KEYS = [
    "gstCert",
    "panCard",
    "cancelledCheque",
    "msmeUdyam",
    "shopAndTradeLicense",
    "ownerAadhaarDoc",
    "oribrixSellerAgreement",
    "iso9001",
];

const DOC_STATUSES = [
    "PENDING",
    "RECEIVED",
    "APPROVED",
    "RE-UPLOAD_REQUESTED",
    "REJECTED",
];

const documentUpdateSchema = Joi.object({
    status: Joi.string()
        .valid(...DOC_STATUSES)
        .required(),
    remarks: Joi.string().allow("").optional(),
});

export const documentVerificationSchema = Joi.object()
    .keys(
        Object.fromEntries(
            DOC_KEYS.map((key) => [key, documentUpdateSchema.optional()])
        )
    )
    .min(1)
    .required()
    .messages({
        "object.min":
            "Provide at least one KYC document to update (e.g. gstCert, panCard)",
    });

export { DOC_KEYS, DOC_STATUSES };
