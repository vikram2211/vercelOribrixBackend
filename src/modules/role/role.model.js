import mongoose from "mongoose";

const { Schema, model } = mongoose;

const roleSchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true
    },

    permissions: [
      {
        type: String
      }
    ]
  },
  {
    timestamps: true
  }
);

export default model("Role", roleSchema);