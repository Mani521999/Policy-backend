import { Schema, model } from "mongoose";
const AgentSchema = new Schema({ name: String });
export default model("Agent", AgentSchema);
