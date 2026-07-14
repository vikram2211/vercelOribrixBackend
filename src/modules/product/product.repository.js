import Product from "./product.model.js";

export const getAllProducts = async (filters = {}) => {
    // Only return active products by default
    const query = { isActive: true, ...filters };

    return await Product.find(query)
        .populate("categoryId", "name slug")
        .populate("subCategoryId", "name slug")
        .populate("brandId", "name logo")
        .populate({
            path: "attributeValueIds",
            select: "value",
            populate: {
                path: "attributeId",
                select: "name inputType"
            }
        })
        .sort({ createdAt: -1 });
};

export const createProduct = async (data) => {
    return await Product.create(data);
};

export const updateProduct = async (id, data) => {
    return await Product.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
    );
};
