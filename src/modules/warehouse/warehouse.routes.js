import express from "express";
import * as warehouseController from "./warehouse.controller.js";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";

const router = express.Router();

// All warehouse routes require validation as a VENDOR_OWNER
router.use(authenticate);
router.use(authorize("VENDOR_OWNER"));

router.post("/", warehouseController.createWarehouse);
router.get("/", warehouseController.getMyWarehouses);
router.put("/:id", warehouseController.updateWarehouse);
router.delete("/:id", warehouseController.deleteWarehouse);

export default router;
