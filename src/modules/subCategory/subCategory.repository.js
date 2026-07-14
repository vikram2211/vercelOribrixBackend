import SubCategory from "./subCategory.model.js";

export const getSubCategoriesByCategoryId = async (categoryId) => {
    return await SubCategory.find({ categoryId, isActive: true }).sort({ displayOrder: 1 });
};
