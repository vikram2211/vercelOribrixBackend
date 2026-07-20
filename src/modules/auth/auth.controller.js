import * as authService from "./auth.service.js";
import { sendResponse } from "../../utils/response.js";
import { registerSchema, loginSchema, verifyOtpSchema, onboardingSchema, sendOtpSchema, customerLoginSchema, refreshTokenSchema } from "./auth.validation.js";
import ApiError from "../../utils/ApiError.js";

export const register = async (req, res, next) => {
    try {
        const { error, value } = registerSchema.validate(req.body);
        if (error) throw new ApiError(400, error.details[0].message);

        // Add photo path if a file was uploaded
        if (req.file) {
            value.photo = req.file.path;
        }

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

        const result = await authService.verifyOTP(value.identifier, value.otp);
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

        // userId is injected by the authenticate middleware via JWT
        const userId = req.user.userId;

        const result = await authService.onboardCustomer(userId, value);
        return sendResponse(res, 200, result.message, result.profile);
    } catch (error) {
        next(error);
    }
};

export const sendOtp = async (req, res, next) => {
    try {
        const { error, value } = sendOtpSchema.validate(req.body);
        if (error) throw new ApiError(400, error.details[0].message);

        const result = await authService.sendOtpForLogin(value.identifier);
        return sendResponse(res, 200, result.status, null);
    } catch (error) {
        next(error);
    }
};

export const customerLogin = async (req, res, next) => {
    try {
        const { error, value } = customerLoginSchema.validate(req.body);
        if (error) throw new ApiError(400, error.details[0].message);

        const result = await authService.loginCustomer(value.identifier, value.password, value.otp);
        return sendResponse(res, 200, result.message, result);
    } catch (error) {
        next(error);
    }
};

export const refreshToken = async (req, res, next) => {
    try {
        const { error, value } = refreshTokenSchema.validate(req.body);
        if (error) throw new ApiError(400, error.details[0].message);

        const result = await authService.refreshTokens(value.refreshToken);
        return sendResponse(res, 200, result.message, {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken
        });
    } catch (error) {
        next(error);
    }
};
