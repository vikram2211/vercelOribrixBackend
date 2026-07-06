import express from "express";
import * as vendorController from "./vendor.controller.js";
import { uploadKYC } from "../../middleware/upload.middleware.js";

const router = express.Router();

router.post("/register", vendorController.register);

router.post("/kyc-upload/:vendorId",
    uploadKYC.fields([
        { name: "gstCert", maxCount: 1 },
        { name: "panCard", maxCount: 1 },
        { name: "cancelledCheque", maxCount: 1 },
        { name: "msmeUdyam", maxCount: 1 }
    ]),
    vendorController.uploadKYC
);

router.get("/status/:userId", vendorController.getStatus);

export default router;
