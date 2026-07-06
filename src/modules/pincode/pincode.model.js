import mongoose from "mongoose";

const { Schema, model } = mongoose;

const pincodeSchema = new Schema(
  {
    pincode: {
      type: String,
      required: true,
      unique: true
    },

    city: String,
    state: String,

    isServiceable: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

export default model("Pincode", pincodeSchema);