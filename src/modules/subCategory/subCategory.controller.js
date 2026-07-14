import * as subCategoryService from "./subCategory.service.js";
import { sendResponse } from "../../utils/response.js";

export const getSubCategories = async (req, res, next) => {
    try {
        const { categoryId } = req.params;
        const subCategories = await subCategoryService.getSubCategoriesByCategory(categoryId);
        return sendResponse(res, 200, "SubCategories retrieved successfully", subCategories);
    } catch (error) {
        next(error);
    }
};
