import { Schema, model } from "mongoose";
const CarrierSchema = new Schema({
  company_name: String
});

export default  model("Carrier", CarrierSchema);
