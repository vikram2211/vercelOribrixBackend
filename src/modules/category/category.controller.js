import asyncHandler from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/response.js";
import pagination from "../../utils/pagination.js";
import * as categoryService from "./category.service.js";

export const displayProductCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.displayProductCategories();
  return sendResponse(res, 200, "Categories fetched successfully", categories);
});

export const displayProductCategories_app = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pagination(req.query);
  const { name } = req.query;

  const result = await categoryService.displayProductCategories_app({
    page,
    limit,
    skip,
    name,
  });

  return sendResponse(res, 200, "Categories fetched successfully", result);
});

export const displayProductCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.displayProductCategory(req.params.id);
  return sendResponse(res, 200, "Category fetched successfully", category);
});

export const addProductCategory = asyncHandler(async (req, res) => {
  const image = req.file?.path || "";
  const category = await categoryService.addProductCategory({
    ...req.body,
    image,
  });
  return sendResponse(res, 201, "Category created successfully", category);
});

export const editProductCategory = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (req.file?.path) {
    payload.image = req.file.path;
  }

  const category = await categoryService.editProductCategory(
    req.params.id,
    payload
  );
  return sendResponse(res, 200, "Category updated successfully", category);
});

export const deleteProductCategory = asyncHandler(async (req, res) => {
  await categoryService.deleteProductCategory(req.params.id);
  return sendResponse(res, 200, "Category deleted successfully");
});
