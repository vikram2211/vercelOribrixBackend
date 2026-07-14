import * as subCategoryRepo from "./subCategory.repository.js";
import ApiError from "../../utils/ApiError.js";

export const getSubCategoriesByCategory = async (categoryId, { page, limit, skip }) => {
    if (!categoryId) {
        throw new ApiError(400, "Category ID is required");
    }

    const { subCategories, total } = await subCategoryRepo.getSubCategoriesPaginated(categoryId, skip, limit);

    return {
        subCategories,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 0
        }
    };
};
