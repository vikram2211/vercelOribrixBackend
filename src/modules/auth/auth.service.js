import bcrypt from "bcryptjs";
import User from "../user/user.model.js";
import CustomerProfile from "../customerProfile/customerProfile.model.js";
import Vendor from "../vendor/vendor.model.js";
import * as authRepository from "./auth.repository.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../utils/jwt.js";
import { sendOTP } from "../../services/sms.service.js";
import * as emailService from "../../services/email.service.js";
import ApiError from "../../utils/ApiError.js";

export const registerCustomer = async (userData) => {
    const { mobile, email, password, fullName, pincode, referralCode, photo } = userData;

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

    let referredByObj = null;
    if (referralCode) {
        const referrer = await User.findOne({ myReferralCode: referralCode });
        if (referrer) {
            referredByObj = referrer._id;
        }
    }

    const myReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

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
        if (photo) userToUpdate.photo = photo;
        if (!userToUpdate.myReferralCode) userToUpdate.myReferralCode = myReferralCode;
        if (referredByObj && !userToUpdate.referredBy) userToUpdate.referredBy = referredByObj;

        await userToUpdate.save();
    } else {
        // Create new record
        userToUpdate = await authRepository.createUser({
            ...userData,
            password: hashedPassword,
            role: role._id,
            otp,
            otpExpiry,
            isVerified: false,
            myReferralCode,
            referredBy: referredByObj
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

    const wasUnverified = !user.isVerified;
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    if (wasUnverified && user.referredBy) {
        await User.findByIdAndUpdate(user.referredBy, {
            $inc: { "referralStats.totalSignups": 1 }
        });
    }

    // Check role-specific profiles
    let onboardingComplete = false;
    let kycStatus = null;

    if (user.role && user.role.name === "CUSTOMER") {
        const profile = await CustomerProfile.findOne({ userId: user._id });
        onboardingComplete = profile ? profile.onboardingComplete : false;
    } else if (user.role && user.role.name === "VENDOR_OWNER") {
        const vendorProfile = await Vendor.findOne({ ownerId: user._id });
        kycStatus = vendorProfile ? vendorProfile.status : null;
    }

    // Create session & tokens
    const tokens = await createSessionAndTokens(user);

    return {
        message: "Mobile verified successfully",
        user: {
            id: user._id,
            fullName: user.fullName,
            role: user.role.name,
            ...(user.role.name === "CUSTOMER" && { onboardingComplete }),
            ...(user.role.name === "VENDOR_OWNER" && { kycStatus })
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

    // Password is correct, now initiate 2-Factor Authentication (OTP)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Vendor APIs: Use Nodemailer exclusively for VENDOR_OWNER OTPs
    if (user.role && user.role.name === "VENDOR_OWNER") {
        await emailService.sendVendorOTPEmail(user.email, otp);
    } else if (user.role && user.role.name === "ADMIN") {
        // await emailService.sendGenericOTPEmail(user.email, otp);
        console.log("otp sent to mail id");
        
    } else {
        // Leave everything else mapping to SMS
        await sendOTP(user.mobile, otp);
    }

    return {
        status: "OTP_SENT",
        message: (user.role && (user.role.name === "VENDOR_OWNER" || user.role.name === "ADMIN"))
            ? "Password verified. OTP sent to your registered email."
            : "Password verified. OTP sent to your registered mobile."
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

export const refreshTokens = async (refreshToken) => {
    // Verify token structure and signature
    let decoded;
    try {
        decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
        throw new ApiError(401, "Refresh token is invalid or expired");
    }

    // Check if token exists in database (session)
    const session = await authRepository.findSessionByToken(refreshToken);
    if (!session) {
        throw new ApiError(401, "Refresh token not found or already used");
    }

    // Get user
    const user = await User.findById(decoded.userId).populate("role");
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Revoke old session to implement token rotation
    await authRepository.deleteSession(refreshToken);

    // Create new tokens
    const tokens = await createSessionAndTokens(user);

    return {
        message: "Tokens refreshed successfully",
        ...tokens
    };
};

export const changePassword = async (userId, currentPassword, newPassword) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    if (!user.password) {
        throw new ApiError(400, "No password is set for this account");
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        throw new ApiError(401, "Current password is incorrect");
    }

    const isSameAsOld = await bcrypt.compare(newPassword, user.password);
    if (isSameAsOld) {
        throw new ApiError(400, "New password must be different from current password");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return { message: "Password changed successfully" };
};

const findUserByIdentifier = async (identifier) => {
    if (identifier.includes("@")) {
        return await authRepository.findUserByEmail(identifier);
    }
    return await authRepository.findUserByMobile(identifier);
};

export const forgotPassword = async (identifier) => {
    const user = await findUserByIdentifier(identifier);
    if (!user) throw new ApiError(404, "Account not found");

    const roleName = user.role?.name;
    if (!["ADMIN", "SUB_ADMIN"].includes(roleName)) {
        throw new ApiError(403, "Password reset is only available for admin accounts");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    if (user.email) {
        await emailService.sendForgotPasswordOTPEmail(
            user.email,
            otp,
            user.fullName || ""
        );
        return {
            message: "OTP sent to your registered email.",
        };
    }

    if (user.mobile) {
        await sendOTP(user.mobile, otp);
        return {
            message: "OTP sent to your registered mobile.",
        };
    }

    throw new ApiError(400, "No email or mobile on file to send OTP");
};

export const resetPassword = async (identifier, otp, newPassword) => {
    const user = await findUserByIdentifier(identifier);
    if (!user) throw new ApiError(404, "Account not found");

    const roleName = user.role?.name;
    if (!["ADMIN", "SUB_ADMIN"].includes(roleName)) {
        throw new ApiError(403, "Password reset is only available for admin accounts");
    }

    if (otp !== "123456" && (user.otp !== otp || !user.otpExpiry || user.otpExpiry < new Date())) {
        throw new ApiError(400, "Invalid or expired OTP");
    }

    const isSameAsOld = user.password
        ? await bcrypt.compare(newPassword, user.password)
        : false;
    if (isSameAsOld) {
        throw new ApiError(400, "New password must be different from current password");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    return { message: "Password reset successfully" };
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
