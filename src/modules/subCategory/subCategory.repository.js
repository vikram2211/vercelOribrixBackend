import SubCategory from "./subCategory.model.js";

export const getSubCategoriesPaginated = async (categoryId, skip, limit) => {
    const filter = { categoryId, isActive: true };
    const [subCategories, total] = await Promise.all([
        SubCategory.find(filter).sort({ displayOrder: 1 }).skip(skip).limit(limit),
        SubCategory.countDocuments(filter)
    ]);
    return { subCategories, total };
};

