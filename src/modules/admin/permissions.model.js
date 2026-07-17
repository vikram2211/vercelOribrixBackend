import mongoose from "mongoose";

const { Schema, model } = mongoose;

const permissionSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        description: {
            type: String,
            default: "",
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

export default model("Permission", permissionSchema);
