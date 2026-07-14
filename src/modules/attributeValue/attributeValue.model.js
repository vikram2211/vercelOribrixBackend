import mongoose from "mongoose";

const { Schema, model } = mongoose;

const attributeValueSchema = new Schema(
    {
        attributeId: {
            type: Schema.Types.ObjectId,
            ref: "Attribute",
            required: true
        },
        value: { // e.g., '33', '43', '53'
            type: String,
            required: true,
            trim: true
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

export default model("AttributeValue", attributeValueSchema);
