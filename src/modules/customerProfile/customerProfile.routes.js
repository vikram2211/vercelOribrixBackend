import express from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import { addSites, deleteProfileDetails, deleteSites, displayProfileDetails, displaySites, editProfileDetails, editSites } from "./customerProfile.controller.js";

const router = express.Router();

router.get("/v1/profile",
    authenticate,
    authorize("CUSTOMER"),
    displayProfileDetails
);
router.patch("/v1/profile", authenticate, authorize("CUSTOMER"), editProfileDetails);
router.delete("/v1/profile", authenticate, authorize("CUSTOMER"), deleteProfileDetails);

// Sites ==================

router.get("/v1/display-sites",authenticate, authorize("CUSTOMER"), displaySites);
router.post("/v1/add-sites", authenticate, authorize("CUSTOMER"),addSites);
router.patch("/v1/edit-sites/:id", authenticate, authorize("CUSTOMER"),editSites);
router.delete("/v1/delete-sites/:id",authenticate, authorize("CUSTOMER"), deleteSites);

export default router;