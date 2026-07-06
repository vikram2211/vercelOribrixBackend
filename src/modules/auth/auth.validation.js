import Joi from "joi";

export const registerSchema = Joi.object({
    fullName: Joi.string().required().trim(),
    mobile: Joi.string().required().pattern(/^[0-9]{10}$/),
    email: Joi.string().email().optional(),
    password: Joi.string().required().min(6),
    pincode: Joi.string().required().length(6)
});

export const loginSchema = Joi.object({
    identifier: Joi.string().required(), // Mobile or Email
    password: Joi.string().required(),
    deviceType: Joi.string().optional(),
    deviceId: Joi.string().optional()
});

export const otpLoginSchema = Joi.object({
    mobile: Joi.string().required().pattern(/^[0-9]{10}$/),
});

export const sendOtpSchema = Joi.object({
    identifier: Joi.string().required(),
});

export const customerLoginSchema = Joi.object({
    identifier: Joi.string().required(),
    password: Joi.string(),
    otp: Joi.string().length(6)
}).xor('password', 'otp');


export const verifyOtpSchema = Joi.object({
    identifier: Joi.string().required(),
    otp: Joi.string().required().length(6)
});

export const onboardingSchema = Joi.object({
    persona: Joi.string().valid("Contractor", "Builder", "Homeowner", "Architect").required(),
    companyName: Joi.string().allow(""),
    gstin: Joi.string().allow(""),
    sites: Joi.array().items(Joi.object({
        siteName: Joi.string().required(),
        location: Joi.string().required(),
        pincode: Joi.string().length(6).required()
    })),
    paymentPreference: Joi.string().valid("UPI", "Card", "EMI", "COD").optional()
});
