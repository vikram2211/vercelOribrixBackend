import multer from "multer";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

// Ensure environment variables are loaded
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "oribrix/kyc",
        allowed_formats: ["jpeg", "jpg", "png", "pdf"], // Allowed file types
        format: async (req, file) => {
            const ext = file.mimetype.split('/')[1];
            return ext === 'pdf' ? 'pdf' : 'jpg'; // Ensure PDFs are correctly saved
        },
        public_id: (req, file) => {
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            return `${file.fieldname}-${uniqueSuffix}`;
        },
    },
});

const fileFilter = (req, file, cb) => {
    const allowedFileTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedFileTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error("Only images (jpeg, jpg, png) and PDFs are allowed!"));
    }
};

export const uploadKYC = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

const categoryStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "oribrix/categories",
        allowed_formats: ["jpeg", "jpg", "png"],
        format: async () => "jpg",
        public_id: (req, file) => {
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            return `${file.fieldname}-${uniqueSuffix}`;
        },
    },
});

const imageFilter = (req, file, cb) => {
    const allowedFileTypes = /jpeg|jpg|png/;
    const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedFileTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error("Only images (jpeg, jpg, png) are allowed!"));
    }
};

export const uploadCategory = multer({
    storage: categoryStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: imageFilter,
});

const profileStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "oribrix/profiles",
        allowed_formats: ["jpeg", "jpg", "png"],
        format: async () => "jpg",
        public_id: (req, file) => {
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            return `${file.fieldname}-${uniqueSuffix}`;
        },
    },
});

export const uploadProfile = multer({
    storage: profileStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: imageFilter,
});

const couponStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "oribrix/coupons",
        allowed_formats: ["jpeg", "jpg", "png"],
        format: async () => "jpg",
        public_id: (req, file) => {
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            return `${file.fieldname}-${uniqueSuffix}`;
        },
    },
});

export const uploadCoupon = multer({
    storage: couponStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: imageFilter,
});

const productStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "oribrix/products",
        allowed_formats: ["jpeg", "jpg", "png", "jfif"],
        format: async () => "jpg", // Always convert to jpg on Cloudinary
        public_id: (req, file) => {
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            return `product-${uniqueSuffix}`;
        },
    },
});

const productImageFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|jfif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /jpeg|jpg|png|jfif/.test(file.mimetype);

    if (extname || mimetype) { // use OR so jfif with image/jpeg mime still passes
        return cb(null, true);
    } else {
        cb(new Error("Only images (jpeg, jpg, png, jfif) are allowed!"));
    }
};

export const uploadProduct = multer({
    storage: productStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per image
    fileFilter: productImageFilter,
});

const warehouseStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "oribrix/warehouses",
        allowed_formats: ["jpeg", "jpg", "png"],
        format: async () => "jpg",
        public_id: (req, file) => {
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            return `warehouse-${uniqueSuffix}`;
        },
    },
});

export const uploadWarehouse = multer({
    storage: warehouseStorage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: imageFilter,
});
