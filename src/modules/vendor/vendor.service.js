import * as vendorRepo from "./vendor.repository.js";
import ApiError from "../../utils/ApiError.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import * as emailService from "../../services/email.service.js";
import * as warehouseService from "../warehouse/warehouse.service.js";

export const registerVendor = async (vendorData) => {
    const { businessDetails, ownerDetails, bankDetails, warehouseDetails, productCategories } = vendorData;

    // Extract credentials from ownerDetails mapping
    const { email, mobile, fullName } = ownerDetails;

    // Check if user exists
    const existingUser = await vendorRepo.findUserByEmailOrPhone(email, mobile);
    if (existingUser) throw new ApiError(400, "User already exists with this email or phone");

    // Get Vendor Owner Role
    const role = await vendorRepo.findRoleByName("VENDOR_OWNER");
    if (!role) throw new ApiError(500, "Vendor Owner role not found");

    // Auto-generate secure password
    const generatedPassword = crypto.randomBytes(4).toString('hex'); // 8 char alphanumeric

    // Hash password
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    // Create User (Owner)
    const owner = await vendorRepo.createUser({
        fullName: fullName || "Vendor Owner",
        email: email,
        mobile: mobile,
        password: hashedPassword,
        role: role._id,
        isVerified: true
    });

    // Create Vendor Profile
    const vendor = await vendorRepo.createVendor({
        ownerId: owner._id,
        businessDetails,
        ownerDetails,
        bankDetails,
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

    // Use Nodemailer to send actual credential email (fire-and-forget to avoid blocking response)
    emailService.sendVendorWelcomeEmail(email, generatedPassword).catch(err => {
        console.error('Welcome email failed to send:', err);
    });

    // Create Initial Warehouse dynamically bridging to Multi-Warehouse architecture!
    if (warehouseDetails && warehouseDetails.warehouseName) {
        await warehouseService.addWarehouse(vendor._id, {
            name: warehouseDetails.warehouseName,
            capacity: warehouseDetails.storageCapacity,
            address: warehouseDetails.address,
            operatingHours: warehouseDetails.operatingHours,
            isActive: true
        });
    }

    return { owner, vendor };
};

export const updateKYCDocuments = async (vendorId, files) => {
    const vendor = await vendorRepo.findVendorById(vendorId);
    if (!vendor) throw new ApiError(404, "Vendor not found");

    if (files.gstCert) vendor.kycDocuments.gstCert = { fileUrl: files.gstCert[0].path, status: "RECEIVED" };
    if (files.panCard) vendor.kycDocuments.panCard = { fileUrl: files.panCard[0].path, status: "RECEIVED" };
    if (files.cancelledCheque) vendor.kycDocuments.cancelledCheque = { fileUrl: files.cancelledCheque[0].path, status: "RECEIVED" };
    if (files.msmeUdyam) vendor.kycDocuments.msmeUdyam = { fileUrl: files.msmeUdyam[0].path, status: "RECEIVED" };
    if (files.shopAndTradeLicense) vendor.kycDocuments.shopAndTradeLicense = { fileUrl: files.shopAndTradeLicense[0].path, status: "RECEIVED" };
    if (files.ownerAadhaarDoc) vendor.kycDocuments.ownerAadhaarDoc = { fileUrl: files.ownerAadhaarDoc[0].path, status: "RECEIVED" };
    if (files.oribrixSellerAgreement) vendor.kycDocuments.oribrixSellerAgreement = { fileUrl: files.oribrixSellerAgreement[0].path, status: "RECEIVED" };
    if (files.iso9001) vendor.kycDocuments.iso9001 = { fileUrl: files.iso9001[0].path, status: "RECEIVED" };

    await vendorRepo.saveVendor(vendor);
    return vendor;
};

export const getVendorProfile = async (userId) => {
    return await vendorRepo.findVendorByOwnerId(userId);
};
