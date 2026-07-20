import express from "express";
import * as brandController from "./brand.controller.js";

const router = express.Router();

router.get("/", brandController.getAllBrands);
router.post("/", brandController.createBrand);

export default router;
