import { Schema, model } from "mongoose";

const ScheduledMessageSchema = new Schema({
  message: String,
  day: String,
  time: String,
  type: String,  // once | weekly
  dateTime: Date,
  weekday: String,
  inserted: { type: Boolean, default: false }
});

export default model("ScheduledMessage", ScheduledMessageSchema);
