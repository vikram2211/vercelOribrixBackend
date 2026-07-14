import * as productRepo from "./product.repository.js";
import ApiError from "../../utils/ApiError.js";

export const fetchAllProducts = async (filters) => {
    return await productRepo.getAllProducts(filters);
};

export const addProduct = async (productData) => {
    if (!productData.name || !productData.categoryId || !productData.brandId) {
        throw new ApiError(400, "Name, Category, and Brand are required");
    }

    // Generate slug securely if not provided
    if (!productData.slug) {
        productData.slug = productData.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    }

    return await productRepo.createProduct(productData);
};
