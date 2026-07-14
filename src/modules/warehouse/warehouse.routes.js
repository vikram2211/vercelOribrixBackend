import express from "express";
import * as warehouseController from "./warehouse.controller.js";

const router = express.Router();

router.post("/", warehouseController.createWarehouse);
router.get("/", warehouseController.getMyWarehouses);

export default router;
