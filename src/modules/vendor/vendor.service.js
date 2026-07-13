import Vendor from "./vendor.model.js";
import User from "../user/user.model.js";
import Role from "../role/role.model.js";
import ApiError from "../../utils/ApiError.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const registerVendor = async (vendorData) => {
    const { businessDetails, ownerDetails, bankDetails, warehouseDetails, productCategories } = vendorData;

    // Extract credentials from ownerDetails mapping
    const { email, mobile, fullName } = ownerDetails;

    // Check if user exists
    const existingUser = await User.findOne({
        $or: [{ email }, { mobile }]
    });
    if (existingUser) throw new ApiError(400, "User already exists with this email or phone");

    // Get Vendor Owner Role
    const role = await Role.findOne({ name: "VENDOR_OWNER" });
    if (!role) throw new ApiError(500, "Vendor Owner role not found");

    // Auto-generate secure password
    const generatedPassword = crypto.randomBytes(4).toString('hex'); // 8 char alphanumeric

    // Hash password
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    // Create User (Owner)
    const owner = await User.create({
        fullName: fullName || "Vendor Owner",
        email: email,
        mobile: mobile,
        password: hashedPassword,
        role: role._id,
        isVerified: true
    });

    // Create Vendor Profile
    const vendor = await Vendor.create({
        ownerId: owner._id,
        businessDetails,
        ownerDetails,
        bankDetails,
        warehouseDetails,
        productCategories,
        kycDocuments: {
            gstCert: { status: "PENDING" },
            panCard: { status: "PENDING" },
            cancelledCheque: { status: "PENDING" },
            msmeUdyam: { status: "PENDING" },
            shopAndTradeLicense: { status: "PENDING" },
            ownerAadhaarDoc: { status: "PENDING" },
            oribrixSellerAgreement: { status: "PENDING" },
            iso9001: { status: "PENDING" }
        }
    });

    // TODO: Actually integrate Mailer/SMS service here
    console.log(`[MOCK MAILER]: Welcome ${email}! Your Oribrix Host login password is: ${generatedPassword}`);

    return { owner, vendor };
};

export const updateKYCDocuments = async (vendorId, files) => {
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) throw new ApiError(404, "Vendor not found");

    if (files.gstCert) vendor.kycDocuments.gstCert = { fileUrl: files.gstCert[0].path, status: "RECEIVED" };
    if (files.panCard) vendor.kycDocuments.panCard = { fileUrl: files.panCard[0].path, status: "RECEIVED" };
    if (files.cancelledCheque) vendor.kycDocuments.cancelledCheque = { fileUrl: files.cancelledCheque[0].path, status: "RECEIVED" };
    if (files.msmeUdyam) vendor.kycDocuments.msmeUdyam = { fileUrl: files.msmeUdyam[0].path, status: "RECEIVED" };
    if (files.shopAndTradeLicense) vendor.kycDocuments.shopAndTradeLicense = { fileUrl: files.shopAndTradeLicense[0].path, status: "RECEIVED" };
    if (files.ownerAadhaarDoc) vendor.kycDocuments.ownerAadhaarDoc = { fileUrl: files.ownerAadhaarDoc[0].path, status: "RECEIVED" };
    if (files.oribrixSellerAgreement) vendor.kycDocuments.oribrixSellerAgreement = { fileUrl: files.oribrixSellerAgreement[0].path, status: "RECEIVED" };
    if (files.iso9001) vendor.kycDocuments.iso9001 = { fileUrl: files.iso9001[0].path, status: "RECEIVED" };

    await vendor.save();
    return vendor;
};

export const getVendorProfile = async (userId) => {
    return await Vendor.findOne({ ownerId: userId }).populate("ownerId", "fullName email mobile");
};
