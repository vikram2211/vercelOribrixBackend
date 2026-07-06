import Vendor from "./vendor.model.js";
import User from "../user/user.model.js";
import Role from "../role/role.model.js";
import ApiError from "../../utils/ApiError.js";
import bcrypt from "bcryptjs";

export const registerVendor = async (vendorData) => {
    const { ownerEmail, ownerPhone, password, ...businessDetails } = vendorData;

    // Check if user exists
    const existingUser = await User.findOne({
        $or: [{ email: ownerEmail }, { mobile: ownerPhone }]
    });
    if (existingUser) throw new ApiError(400, "User already exists with this email or phone");

    // Get Vendor Owner Role
    const role = await Role.findOne({ name: "VENDOR_OWNER" });
    if (!role) throw new ApiError(500, "Vendor Owner role not found");

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User (Owner)
    const owner = await User.create({
        fullName: businessDetails.legalBusinessName, // Using business name as default name
        email: ownerEmail,
        mobile: ownerPhone,
        password: hashedPassword,
        role: role._id,
        isVerified: true // Assuming verified for now or add OTP step if needed
    });

    // Create Vendor Profile
    const vendor = await Vendor.create({
        ownerId: owner._id,
        ...businessDetails,
        kycDocuments: {
            gstCert: { status: "PENDING" },
            panCard: { status: "PENDING" },
            cancelledCheque: { status: "PENDING" },
            msmeUdyam: { status: "PENDING" }
        }
    });

    return { owner, vendor };
};

export const updateKYCDocuments = async (vendorId, files) => {
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) throw new ApiError(404, "Vendor not found");

    if (files.gstCert) vendor.kycDocuments.gstCert = { fileUrl: files.gstCert[0].path, status: "RECEIVED" };
    if (files.panCard) vendor.kycDocuments.panCard = { fileUrl: files.panCard[0].path, status: "RECEIVED" };
    if (files.cancelledCheque) vendor.kycDocuments.cancelledCheque = { fileUrl: files.cancelledCheque[0].path, status: "RECEIVED" };
    if (files.msmeUdyam) vendor.kycDocuments.msmeUdyam = { fileUrl: files.msmeUdyam[0].path, status: "RECEIVED" };

    await vendor.save();
    return vendor;
};

export const getVendorProfile = async (userId) => {
    return await Vendor.findOne({ ownerId: userId }).populate("ownerId", "fullName email mobile");
};
