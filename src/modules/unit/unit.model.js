import mongoose from "mongoose";

const { Schema, model } = mongoose;

const unitSchema = new Schema(
    {
        name: {
            type: String,
            unique: true
        },

        shortName: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

export default model("Unit", unitSchema);