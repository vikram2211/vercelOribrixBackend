import express from "express";
import * as productController from "./product.controller.js";
import { uploadProduct } from "../../middleware/upload.middleware.js";

const router = express.Router();

router.get("/", productController.getAllProducts);
router.post("/", productController.createProduct);
router.put(
    "/:id",
    uploadProduct.fields([
        { name: "thumbnail", maxCount: 1 },
        { name: "images", maxCount: 10 }
    ]),
    productController.updateProduct
);

export default router;
