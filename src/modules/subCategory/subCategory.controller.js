import * as subCategoryService from "./subCategory.service.js";
import { sendResponse } from "../../utils/response.js";
import pagination from "../../utils/pagination.js";

export const getSubCategories = async (req, res, next) => {
    try {
        // Extract categoryId from query ?categoryId=...
        const { categoryId } = req.query;
        const { page, limit, skip } = pagination(req.query);

        const result = await subCategoryService.getSubCategoriesByCategory(categoryId, { page, limit, skip });
        return sendResponse(res, 200, "SubCategories retrieved successfully", result);
    } catch (error) {
        next(error);
    }
};
