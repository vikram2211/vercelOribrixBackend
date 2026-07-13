import { model, Schema } from "mongoose";

const addressSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        siteId: {
            type: Schema.Types.ObjectId,
            ref: "Site",
        },
        fullName: {
            type: String,
        },
        mobileNo: {
            type: String,
        },
        address: {
            type: String,
        },
        landmark: {
            type: String,
        },
        city: {
            type: String,
        },
        state: {
            type: String,
        },
        pinCode: {
            type: Number,
        },
        addressType: {
            type: String,
            enum: ["Home", "Work", "Other"],
            default: "Home",
        },
        isDelete: {
            type: Boolean,
            default: false,
        },
        isSelect: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export default model("Address", addressSchema);
