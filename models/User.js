import { Schema, model } from "mongoose";

const UserSchema = new Schema({
  firstName: String,
  dob: Date,
  address: String,
  phone: String,
  state: String,
  zip: String,
  email: String,
  gender: String,
  userType: String
});

export default model("User", UserSchema);
