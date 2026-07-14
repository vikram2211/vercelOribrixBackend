import mongoose from "mongoose";

// Import schemas to explicitly register them in Mongoose before they are populated
import "../brand/brand.model.js";
import "../subCategory/subCategory.model.js";
import "../attributeValue/attributeValue.model.js";

const { Schema, model } = mongoose;

const productSchema = new Schema(
    {
        categoryId: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },
        subCategoryId: {
            type: Schema.Types.ObjectId,
            ref: "SubCategory"
        },
        brandId: {
            type: Schema.Types.ObjectId,
            ref: "Brand",
            required: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        description: {
            type: String
        },
        thumbnail: {
            type: String
        },
        images: [{
            type: String
        }],
        attributeValueIds: [{
            type: Schema.Types.ObjectId,
            ref: "AttributeValue"
        }],
        hsnCode: {
            type: String
        },
        gstPercentage: {
            type: Number
        },
        warranty: {
            type: String
        },
        returnPolicy: {
            type: String
        },
        seoTitle: {
            type: String
        },
        seoDescription: {
            type: String
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

export default model("Product", productSchema);
