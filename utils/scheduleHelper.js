import schedule from "node-schedule";

import Message from "../models/Message.js";


const scheduleMessageJob = async (doc, ScheduledMessage) => {
  try {
    if (doc.type === "once") {
      const date = new Date(doc.dateTime);

      console.log("date < new Date()", date < new Date());
      if (date < new Date()) return; 

      schedule.scheduleJob(date, async () => {
        await Message.create({
          message: doc.message,
          insertedAt: new Date(),
        });
        await ScheduledMessage.findByIdAndUpdate(doc._id, { inserted: true });
        console.log(" One-time message:", doc.message);
      });
    }

    else if (doc.type === "weekly") {
      const [h, m] = doc.time.split(":").map(Number);

      console.log("scheduleMessageJob time parts:", h, m, doc.time);

      const days = {
        sunday: 0,
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
      };

      const rule = new schedule.RecurrenceRule();
      rule.dayOfWeek = days[doc.weekday.toLowerCase()];
      rule.hour = h;
      rule.minute = m;
      rule.tz = "Asia/Kolkata"; 

      console.log(" Recurrence rule created:", rule);

      schedule.scheduleJob(rule, async () => {
        await Message.create({
          message: doc.message,
          insertedAt: new Date(),
        });
         await ScheduledMessage.findByIdAndUpdate(doc._id, { inserted: true });
        console.log("Weekly message inserted:", doc.message);
      });
    }
  } catch (e) {
    console.error("scheduleMessageJob_err", e);
  }
};



export { scheduleMessageJob };
