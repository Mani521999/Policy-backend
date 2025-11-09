import { Schema, model } from "mongoose";

const MessageSchema = new Schema(
  {
    message: String,
    insertedAt: Date,
  },
  { timestamps: true }
);

export default model("Message", MessageSchema);
