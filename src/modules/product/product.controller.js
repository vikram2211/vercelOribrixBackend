import * as productService from "./product.service.js";
import { sendResponse } from "../../utils/response.js";

export const getAllProducts = async (req, res, next) => {
    try {
        // Pass req.query for basic filtering (e.g. ?categoryId=123)
        const products = await productService.fetchAllProducts(req.query);
        return sendResponse(res, 200, "Products retrieved successfully", products);
    } catch (error) {
        next(error);
    }
};

export const createProduct = async (req, res, next) => {
    try {
        const newProduct = await productService.addProduct(req.body);
        return sendResponse(res, 201, "Master product created successfully", newProduct);
    } catch (error) {
        next(error);
    }
};

export const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Start with any non-file fields sent in the form-data body
        const updateData = { ...req.body };

        // If a single thumbnail was uploaded via field name 'thumbnail'
        if (req.files?.thumbnail?.[0]) {
            updateData.thumbnail = req.files.thumbnail[0].path;
        }

        // If multiple product images were uploaded via field name 'images'
        if (req.files?.images?.length > 0) {
            updateData.images = req.files.images.map(f => f.path);
        }

        const updatedProduct = await productService.editProduct(id, updateData);
        return sendResponse(res, 200, "Product updated successfully", updatedProduct);
    } catch (error) {
        next(error);
    }
};
