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

// Staff routes
router.post("/staff", warehouseController.createStaff);
router.get("/staff", warehouseController.getWarehouseStaff); // ?warehouseId=...
router.patch("/staff/:id/status", warehouseController.updateStaffStatus);

export default router;
