import mongoose from "mongoose";

const { Schema, model } = mongoose;

const cartItemSchema = new Schema(
    {
        vendorProductId: {
            type: Schema.Types.ObjectId,
            ref: "VendorProduct",
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        }
    },
    { _id: false }
);

const cartSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },
        items: [cartItemSchema]
    },
    {
        timestamps: true
    }
);

export default model("Cart", cartSchema);
