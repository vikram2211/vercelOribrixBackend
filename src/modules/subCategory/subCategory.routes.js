import express from "express";
import * as subCategoryController from "./subCategory.controller.js";

const router = express.Router();

router.get("/", subCategoryController.getSubCategories);

export default router;
