import Attribute from "./attribute.model.js";
import AttributeValue from "../attributeValue/attributeValue.model.js";
import { sendResponse } from "../../utils/response.js";

// Get attributes and their values for a specific category
export const getAttributesByCategory = async (req, res, next) => {
    try {
        const { categoryId } = req.query;
        if (!categoryId) {
            return res.status(400).json({ success: false, message: "categoryId query parameter is required" });
        }

        // Fetch all attributes for this category
        const attributes = await Attribute.find({ categoryId }).lean();

        // For each attribute, fetch its possible values
        const attributesWithValues = await Promise.all(
            attributes.map(async (attr) => {
                const values = await AttributeValue.find({ attributeId: attr._id }).sort({ displayOrder: 1 }).lean();
                return { ...attr, values };
            })
        );

        return sendResponse(res, 200, "Attributes retrieved successfully", attributesWithValues);
    } catch (error) {
        next(error);
    }
};

export const createAttribute = async (req, res, next) => {
    try {
        const { name, categoryId } = req.body;
        if (!name || !categoryId) return res.status(400).json({ success: false, message: "Name and categoryId are required" });

        const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
        const newAttribute = await Attribute.create({ ...req.body, slug });

        return sendResponse(res, 201, "Attribute created successfully", newAttribute);
    } catch (error) {
        next(error);
    }
};

export const createAttributeValue = async (req, res, next) => {
    try {
        const { attributeId } = req.params;
        const { value } = req.body;

        const newValue = await AttributeValue.create({ attributeId, value, ...req.body });
        return sendResponse(res, 201, "Attribute value created successfully", newValue);
    } catch (error) {
        next(error);
    }
};
