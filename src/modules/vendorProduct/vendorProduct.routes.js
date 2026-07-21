import express from "express";
import * as vendorProductController from "./vendorProduct.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { uploadProduct } from "../../middleware/upload.middleware.js";

const router = express.Router();

// Apply auth middleware to get vendorId securely from the logged in user token
router.post("/", authenticate, uploadProduct.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'images', maxCount: 6 }]), vendorProductController.createListing);
router.post("/bulk", authenticate, vendorProductController.bulkCreateListings);
router.get("/search", vendorProductController.searchListings);  // For buyers filtering by subCategory!
router.get("/details", authenticate, vendorProductController.getListingDetails); // PDP - ?listingId=...
router.get("/", authenticate, vendorProductController.getListings);
router.put("/:id", authenticate, vendorProductController.updateListing);
router.delete("/:id", authenticate, vendorProductController.deleteListing);

export default router;
