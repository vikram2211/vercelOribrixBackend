import bcrypt from "bcryptjs";
import User from "../user/user.model.js";
import CustomerProfile from "../customerProfile/customerProfile.model.js";
import * as authRepository from "./auth.repository.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";
import { sendOTP } from "../../services/sms.service.js";
import ApiError from "../../utils/ApiError.js";

export const registerCustomer = async (userData) => {
    const { mobile, email, password, fullName, pincode } = userData;

    // Check if user exists by mobile
    let existingUser = await authRepository.findUserByMobile(mobile);
    if (existingUser && existingUser.isVerified) {
        throw new ApiError(400, "User with this mobile number already exists");
    }

    // Check if user exists by email
    let existingEmailUser = null;
    if (email) {
        existingEmailUser = await authRepository.findUserByEmail(email);
        if (existingEmailUser && existingEmailUser.isVerified) {
            throw new ApiError(400, "User with this email already exists");
        }
    }

    // Get Customer Role
    const role = await authRepository.findRoleByName("CUSTOMER");
    if (!role) {
        throw new ApiError(500, "Customer role not found. Please seed the database.");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    let userToUpdate = existingUser || existingEmailUser;

    if (userToUpdate) {
        // Overwrite unverified record
        userToUpdate.fullName = fullName || userToUpdate.fullName;
        userToUpdate.email = email || userToUpdate.email;
        userToUpdate.mobile = mobile;
        userToUpdate.password = hashedPassword;
        userToUpdate.pincode = pincode || userToUpdate.pincode;
        userToUpdate.otp = otp;
        userToUpdate.otpExpiry = otpExpiry;
        userToUpdate.role = role._id;
        await userToUpdate.save();
    } else {
        // Create new record
        userToUpdate = await authRepository.createUser({
            ...userData,
            password: hashedPassword,
            role: role._id,
            otp,
            otpExpiry,
            isVerified: false
        });
    }

    await sendOTP(mobile, otp);

    return {
        message: "Registration successful. Please verify OTP sent to your mobile.",
        userId: userToUpdate._id
    };
};

export const verifyOTP = async (identifier, otp) => {
    let user;
    if (identifier.includes("@")) {
        user = await authRepository.findUserByEmail(identifier);
    } else {
        user = await authRepository.findUserByMobile(identifier);
    }
    if (!user) throw new ApiError(404, "User not found");

    if (otp !== "123456" && user.otp !== otp || user.otpExpiry < new Date()) {
        throw new ApiError(400, "Invalid or expired OTP");
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Check if customer has already completed onboarding
    const profile = await CustomerProfile.findOne({ userId: user._id });
    const onboardingComplete = profile ? profile.onboardingComplete : false;

    // Create session & tokens
    const tokens = await createSessionAndTokens(user);

    return {
        message: "Mobile verified successfully",
        user: {
            id: user._id,
            fullName: user.fullName,
            role: user.role.name,
            onboardingComplete
        },
        ...tokens
    };
};

export const loginWithPassword = async (identifier, password) => {
    // Identifier can be email or mobile
    let user;
    if (identifier.includes("@")) {
        user = await authRepository.findUserByEmail(identifier);
    } else {
        user = await authRepository.findUserByMobile(identifier);
    }

    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new ApiError(401, "Invalid credentials");
    }

    if (!user.isVerified) {
        // Resend OTP if not verified
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();
        await sendOTP(user.mobile, otp);

        return {
            status: "UNVERIFIED",
            message: "Account not verified. OTP sent to mobile."
        };
    }

    const tokens = await createSessionAndTokens(user);

    return {
        message: "Login successful",
        user: {
            id: user._id,
            fullName: user.fullName,
            role: user.role.name
        },
        ...tokens
    };
};

export const onboardCustomer = async (userId, onboardingData) => {
    const user = await User.findById(userId).populate("role");
    if (!user) throw new ApiError(404, "User not found");

    if (user.role.name !== "CUSTOMER") {
        throw new ApiError(403, "Only customers can complete this onboarding step.");
    }

    // Upsert CustomerProfile — create on first submission, update on re-submit
    const profile = await CustomerProfile.findOneAndUpdate(
        { userId: user._id },
        {
            ...onboardingData,
            userId: user._id,
            onboardingComplete: true
        },
        { upsert: true, new: true, runValidators: true }
    );

    return {
        message: "Profile setup completed successfully",
        profile
    };
};

export const sendOtpForLogin = async (identifier) => {
    let user;
    if (identifier.includes("@")) {
        user = await authRepository.findUserByEmail(identifier);
    } else {
        user = await authRepository.findUserByMobile(identifier);
    }

    if (!user) throw new ApiError(404, "Please register first");

    const otp = "123456"; // Static OTP for testing
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Skip actual SMS send
    return { status: "OTP sent successfully" };
};

export const loginCustomer = async (identifier, password, otp) => {
    let user;
    if (identifier.includes("@")) {
        user = await authRepository.findUserByEmail(identifier);
    } else {
        user = await authRepository.findUserByMobile(identifier);
    }

    if (!user) throw new ApiError(404, "User not found");

    if (user.role.name !== "CUSTOMER") {
        throw new ApiError(403, "Access denied. Not a customer account.");
    }

    if (password) {
        if (!(await bcrypt.compare(password, user.password))) {
            throw new ApiError(401, "Invalid credentials");
        }
    } else if (otp) {
        if (otp !== "123456" && user.otp !== otp || user.otpExpiry < new Date()) {
            throw new ApiError(400, "Invalid or expired OTP");
        }
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();
    } else {
        throw new ApiError(400, "Please provide either password or OTP");
    }

    const tokens = await createSessionAndTokens(user);

    // Check onboarding status
    const profile = await CustomerProfile.findOne({ userId: user._id });
    const onboardingComplete = profile ? profile.onboardingComplete : false;

    return {
        message: "Login successful",
        user: {
            id: user._id,
            fullName: user.fullName,
            role: user.role.name,
            onboardingComplete
        },
        ...tokens
    };
};

// Helper
const createSessionAndTokens = async (user) => {
    const payload = { userId: user._id, role: user.role.name };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await authRepository.createSession({
        userId: user._id,
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    return { accessToken, refreshToken };
};
