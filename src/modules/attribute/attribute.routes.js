import express from "express";
import * as attributeController from "./attribute.controller.js";

const router = express.Router();

router.get("/", attributeController.getAttributesByCategory);

// Helper endpoints to quickly seed data
router.post("/", attributeController.createAttribute);
router.post("/:attributeId/values", attributeController.createAttributeValue);

export default router;
