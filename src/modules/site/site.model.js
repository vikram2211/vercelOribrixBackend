import { model, Schema } from "mongoose";

const memberSchema = new Schema(
    {
        name: {
            type: String,
            required: false,
            trim: true,
        },
    },
    { _id: true }
);

const siteSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        siteName: {
            type: String,
            trim: true,
        },
        siteAddress: {
            type: String,
            trim: true,
        },
        pinCode: {
            type: String,
            match: /^[0-9]{6}$/,
        },
        isDelete: {
            type: Boolean,
            default: false,
        },
        members: [memberSchema],
    },
    { timestamps: true }
);

export default model("Site", siteSchema);
