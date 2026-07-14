import express from "express";
import * as vendorProductController from "./vendorProduct.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = express.Router();

// Apply auth middleware if strictly needed, though controller extracts vendorId flexibly
router.post("/", vendorProductController.createListing);
router.get("/search", vendorProductController.searchListings); // For buyers filtering by subCategory!
router.get("/", vendorProductController.getListings);
router.put("/:id", vendorProductController.updateListing);
router.delete("/:id", vendorProductController.deleteListing);

export default router;
