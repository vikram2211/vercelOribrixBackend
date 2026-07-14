import express from "express";
import * as productController from "./product.controller.js";
// Optionally import auth for Admin-only creation

const router = express.Router();

router.get("/", productController.getAllProducts);
router.post("/", productController.createProduct);

export default router;
