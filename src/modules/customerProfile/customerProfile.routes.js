import express from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import { deleteProfileDetails, displayProfileDetails, editProfileDetails } from "./customerProfile.controller.js";
import { displaySites ,addSites, editSites, deleteSites, displaySiteName,} from "../site/site.controller.js";
import { addAddress, deleteAddress, displayAddress, editAddress } from "../address/address.controller.js";

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
router.get("/v1/display-sites-name",authenticate, authorize("CUSTOMER"),displaySiteName);

// address ==================

router.get("/v1/display-address",authenticate, authorize("CUSTOMER"), displayAddress);
router.post("/v1/add-address", authenticate, authorize("CUSTOMER"),addAddress);
router.patch("/v1/edit-address/:id", authenticate, authorize("CUSTOMER"),editAddress);
router.delete("/v1/delete-address/:id",authenticate, authorize("CUSTOMER"), deleteAddress);

export default router;