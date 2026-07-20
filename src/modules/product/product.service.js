import * as productRepo from "./product.repository.js";
import ApiError from "../../utils/ApiError.js";

export const fetchAllProducts = async (filters) => {
    return await productRepo.getAllProducts(filters);
};

export const addProduct = async (productData) => {
    if (!productData.name || !productData.categoryId || !productData.brandId || !productData.unit) {
        throw new ApiError(400, "Name, Category, Brand, and Unit are required");
    }

    // Generate slug securely if not provided
    if (!productData.slug) {
        productData.slug = productData.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    }

    // Auto-generate SKU for new master catalog items if not explicitly provided
    if (!productData.sku) {
        productData.sku = 'OBX-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Date.now().toString(36).slice(-4).toUpperCase();
    }

    return await productRepo.createProduct(productData);
};

export const editProduct = async (id, updateData) => {
    const product = await productRepo.updateProduct(id, updateData);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }
    return product;
};
