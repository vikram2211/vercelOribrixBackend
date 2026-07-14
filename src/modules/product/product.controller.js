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
