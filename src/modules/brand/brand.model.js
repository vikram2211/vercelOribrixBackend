import mongoose from "mongoose";

const { Schema, model } = mongoose;

const brandSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },

        logo: String,

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

export default model("Brand", brandSchema);