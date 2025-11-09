import { Schema, model } from "mongoose";

const UserAccountSchema = new Schema({
  accountName: String,
  user: { type: Schema.Types.ObjectId, ref: "User" }
});

export default model("UserAccount", UserAccountSchema);
