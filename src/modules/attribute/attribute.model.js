import mongoose from "mongoose";

const { Schema, model } = mongoose;

const attributeSchema = new Schema(
    {
        categoryId: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },
        name: { // e.g., Grade, Color, Diameter
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
        inputType: {
            type: String
        },
        isFilterable: {
            type: Boolean,
            default: true
        },
        isRequired: {
            type: Boolean,
            default: false
        },
        displayOrder: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

export default model("Attribute", attributeSchema);
