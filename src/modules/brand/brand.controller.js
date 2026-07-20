import Brand from "./brand.model.js";
import { sendResponse } from "../../utils/response.js";

export const getAllBrands = async (req, res, next) => {
    try {
        const brands = await Brand.find({ isActive: true }).sort({ name: 1 });
        return sendResponse(res, 200, "Brands retrieved successfully", brands);
    } catch (error) {
        next(error);
    }
};

export const createBrand = async (req, res, next) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ success: false, message: "Name is required" });

        const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
        const newBrand = await Brand.create({ ...req.body, slug });

        return sendResponse(res, 201, "Brand created successfully", newBrand);
    } catch (error) {
        next(error);
    }
};
