import express from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import { deleteProfileDetails, displayProfileDetails, editProfileDetails } from "./customerProfile.controller.js";

const router = express.Router();

router.get("/v1/profile",
    authenticate,
    authorize("CUSTOMER"),
    displayProfileDetails
);
router.patch("/v1/profile", authenticate, authorize("CUSTOMER"), editProfileDetails);
router.delete("/v1/profile", authenticate, authorize("CUSTOMER"), deleteProfileDetails);

export default router;