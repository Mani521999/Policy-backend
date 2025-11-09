import { Schema, model } from "mongoose";

const PolicySchema = new Schema({
  policyNumber: String,
  startDate: Date,
  endDate: Date,
  policyCategory: String,
  collectionId: String,
  companyCollectionId: String,
  premiumAmount: Number,
  producer: String,
  user: { type: Schema.Types.ObjectId, ref: "User" },
  carrier: { type: Schema.Types.ObjectId, ref: "Carrier" },
  lob: { type: Schema.Types.ObjectId, ref: "LOB" },
  agent: { type: Schema.Types.ObjectId, ref: "Agent" }
});

export default  model("Policy", PolicySchema);

