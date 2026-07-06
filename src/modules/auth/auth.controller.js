import * as authService from "./auth.service.js";
import { sendResponse } from "../../utils/response.js";
import { registerSchema, loginSchema, verifyOtpSchema, onboardingSchema } from "./auth.validation.js";
import ApiError from "../../utils/ApiError.js";

export const register = async (req, res, next) => {
    try {
        const { error, value } = registerSchema.validate(req.body);
        if (error) throw new ApiError(400, error.details[0].message);

        const result = await authService.registerCustomer(value);
        return sendResponse(res, 201, result.message, { userId: result.userId });
    } catch (error) {
        next(error);
    }
};

export const verifyOtp = async (req, res, next) => {
    try {
        const { error, value } = verifyOtpSchema.validate(req.body);
        if (error) throw new ApiError(400, error.details[0].message);

        const result = await authService.verifyOTP(value.mobile, value.otp);
        return sendResponse(res, 200, result.message, result);
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { error, value } = loginSchema.validate(req.body);
        if (error) throw new ApiError(400, error.details[0].message);

        const result = await authService.loginWithPassword(value.identifier, value.password);
        return sendResponse(res, 200, result.message, result);
    } catch (error) {
        next(error);
    }
};

export const onboard = async (req, res, next) => {
    try {
        const { error, value } = onboardingSchema.validate(req.body);
        if (error) throw new ApiError(400, error.details[0].message);

        // Assume userId comes from auth middleware later, for now from body or params for testing
        const userId = req.body.userId || req.params.userId;
        if (!userId) throw new ApiError(400, "User ID is required for onboarding");

        const result = await authService.onboardCustomer(userId, value);
        return sendResponse(res, 200, result.message, result.user);
    } catch (error) {
        next(error);
    }
};
