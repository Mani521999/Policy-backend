import { Schema, model } from "mongoose";
const LobSchema = new Schema({
  category_name: String
});

export default  model("LOB", LobSchema);
