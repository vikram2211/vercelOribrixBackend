import ApiError from "../../utils/ApiError.js";
import * as categoryRepo from "./category.repository.js";

const slugify = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const displayProductCategories = async () => {
  return await categoryRepo.findAllCategories();
};

export const displayProductCategories_app = async ({ page, limit, skip, name }) => {
  const filter = { isActive: true };

  if (name?.trim()) {
    filter.name = { $regex: name.trim(), $options: "i" };
  }

  const { categories, total } = await categoryRepo.findCategoriesPaginated({
    filter,
    skip,
    limit,
  });

  return {
    categories,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    },
  };
};

export const displayProductCategory = async (id) => {
  const category = await categoryRepo.findActiveCategoryById(id);
  if (!category) throw new ApiError(404, "Category not found");
  return category;
};

export const addProductCategory = async ({ name, isActive, image }) => {
  if (!name?.trim()) throw new ApiError(400, "Category name is required");

  const existing = await categoryRepo.findCategoryByName(name.trim());
  if (existing) throw new ApiError(400, "Category already exists");

  const slug = slugify(name);
  const slugExists = await categoryRepo.findCategoryBySlug(slug);
  if (slugExists) throw new ApiError(400, "Category slug already exists");

  return await categoryRepo.createCategory({
    name: name.trim(),
    slug,
    image: image || "",
    isActive: isActive !== undefined ? isActive : true,
  });
};

export const editProductCategory = async (id, { name, isActive, image }) => {
  const category = await categoryRepo.findCategoryById(id);
  if (!category) throw new ApiError(404, "Category not found");

  const updateData = {};

  if (name !== undefined) {
    const trimmedName = name.trim();
    if (!trimmedName) throw new ApiError(400, "Category name is required");

    const existing = await categoryRepo.findCategoryByName(trimmedName);
    if (existing && existing._id.toString() !== id) {
      throw new ApiError(400, "Category already exists");
    }

    updateData.name = trimmedName;
    updateData.slug = slugify(trimmedName);

    const slugExists = await categoryRepo.findCategoryBySlug(updateData.slug);
    if (slugExists && slugExists._id.toString() !== id) {
      throw new ApiError(400, "Category slug already exists");
    }
  }

  if (isActive !== undefined) {
    updateData.isActive = isActive === true || isActive === "true";
  }

  if (image !== undefined) {
    updateData.image = image;
  }

  return await categoryRepo.updateCategoryById(id, updateData);
};

export const deleteProductCategory = async (id) => {
  const category = await categoryRepo.softDeleteCategoryById(id);
  if (!category) throw new ApiError(404, "Category not found");
  return category;
};
