import express from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";
import { AdminPermissions } from "../admin/admin.routes.js";
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


router.get(
  "/v1/public/categories",
  displayProductCategories_app
);

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
  authorize(AdminPermissions),
  displayProductCategories
);

// Get single category
router.get(
  "/v1/categories/:id",
  authenticate,
  authorize(AdminPermissions),
  displayProductCategory
);

// Create category
router.post(
  "/v1/categories",
  authenticate,
  authorize(AdminPermissions),
  uploadCategory.single("image"),
  addProductCategory
);

// Update category
router.put(
  "/v1/categories/:id",
  authenticate,
  authorize(AdminPermissions),
  uploadCategory.single("image"),
  editProductCategory
);

// Delete category
router.delete(
  "/v1/categories/:id",
  authenticate,
  authorize(AdminPermissions),
  deleteProductCategory
);

export default router;
