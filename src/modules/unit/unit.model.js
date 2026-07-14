import mongoose from "mongoose";

const { Schema, model } = mongoose;

const unitSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        shortName: { // e.g., Kg, Ton, CFT
            type: String,
            required: true,
            trim: true
        },
        type: {
            type: String
        },
        isDecimal: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

export default model("Unit", unitSchema);