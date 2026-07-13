import express from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import { uploadCategory } from "../../middleware/upload.middleware.js";
import {
  displayProductCategories,
  displayProductCategories_app,
  displayProductCategory,
  addProductCategory,
  editProductCategory,
  deleteProductCategory,
} from "./category.controller.js";

const router = express.Router();

// CUSTOMER ====
// Get all categories for user Home Page
router.get(
  "/v1/categories",
  authenticate,
  authorize("CUSTOMER"),
  displayProductCategories_app
);

// admin ====
// Get all categories
router.get(
  "/v1/admin/categories",
  authenticate,
  authorize("ADMIN"),
  displayProductCategories
);

// Get single category
router.get(
  "/v1/categories/:id",
  authenticate,
  authorize("ADMIN"),
  displayProductCategory
);

// Create category
router.post(
  "/v1/categories",
  authenticate,
  authorize("ADMIN"),
  uploadCategory.single("image"),
  addProductCategory
);

// Update category
router.put(
  "/v1/categories/:id",
  authenticate,
  authorize("ADMIN"),
  uploadCategory.single("image"),
  editProductCategory
);

// Delete category
router.delete(
  "/v1/categories/:id",
  authenticate,
  authorize("ADMIN"),
  deleteProductCategory
);

export default router;
