import mongoose from "mongoose";

const { Schema, model } = mongoose;

const subCategorySchema = new Schema(
    {
        categoryId: {
            type: Schema.Types.ObjectId,
            ref: "Category",
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
        image: {
            type: String
        },
        description: {
            type: String
        },
        displayOrder: {
            type: Number,
            default: 0
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

export default model("SubCategory", subCategorySchema);
