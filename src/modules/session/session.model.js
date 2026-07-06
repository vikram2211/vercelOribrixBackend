import mongoose from "mongoose";

const { Schema, model } = mongoose;

const sessionSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        refreshToken: {
            type: String,
            required: true
        },

        deviceType: {
            type: String
        },

        deviceId: {
            type: String
        },

        expiresAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

export default model("Session", sessionSchema);