import Category from "./category.model.js";

export const findAllCategories = async () => {
  return await Category.find({ isActive: true }).sort({ createdAt: 1 });
};

export const findCategoriesPaginated = async ({ filter, skip, limit }) => {
  const [categories, total] = await Promise.all([
    Category.find(filter).sort({ createdAt: 1 }).skip(skip).limit(limit),
    Category.countDocuments(filter),
  ]);

  return { categories, total };
};

export const findCategoryById = async (id) => {
  return await Category.findById(id);
};

export const findActiveCategoryById = async (id) => {
  return await Category.findOne({ _id: id, isActive: true });
};

export const findCategoryBySlug = async (slug) => {
  return await Category.findOne({ slug });
};

export const findCategoryByName = async (name) => {
  return await Category.findOne({ name });
};

export const createCategory = async (data) => {
  return await Category.create(data);
};

export const updateCategoryById = async (id, data) => {
  return await Category.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

export const softDeleteCategoryById = async (id) => {
  return await Category.findOneAndUpdate(
    { _id: id, isActive: true },
    { isActive: false },
    { new: true }
  );
};
