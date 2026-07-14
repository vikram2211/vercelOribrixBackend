import express from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import {
    displayAllKYC_Vender,
    displayKYC_Vender_fullDetails,
    documentVerification,
} from "./kyc.controller.js";

const router = express.Router();

router.get(
    "/v1/display-kyc",
    authenticate,
    authorize("ADMIN"),
    displayAllKYC_Vender
);
router.get(
    "/v1/display-kyc/:id",
    authenticate,
    authorize("ADMIN"),
    displayKYC_Vender_fullDetails
);
router.patch(
    "/v1/document-verification/:id",
    authenticate,
    authorize("ADMIN"),
    documentVerification
);

export default router;