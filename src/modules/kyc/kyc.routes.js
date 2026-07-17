import express from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import { AdminPermissions } from "../admin/admin.routes.js";
import {
    displayAllKYC_Vender,
    displayKYC_Vender_fullDetails,
    documentVerification,
} from "./kyc.controller.js";

const router = express.Router();

router.get(
    "/v1/display-all",
    authenticate,
    authorize(AdminPermissions),
    displayAllKYC_Vender
);
router.get(
    "/v1/display/:id",
    authenticate,
    authorize(AdminPermissions),
    displayKYC_Vender_fullDetails
);
router.patch(
    "/v1/document-verification/:id",
    authenticate,
    authorize(AdminPermissions),
    documentVerification
);

export default router;