import * as subCategoryRepo from "./subCategory.repository.js";
import ApiError from "../../utils/ApiError.js";

export const getSubCategoriesByCategory = async (categoryId) => {
    if (!categoryId) {
        throw new ApiError(400, "Category ID is required");
    }
    return await subCategoryRepo.getSubCategoriesByCategoryId(categoryId);
};
