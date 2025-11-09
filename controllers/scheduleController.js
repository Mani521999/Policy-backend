import { connectDB } from "../db/index.js";
import ScheduledMessage from "../models//ScheduledMessage.js";

import { sendResponse } from "../utils/library.js";
import { scheduleMessageJob } from "../utils/scheduleHelper.js";

/**
 * Method : POST
 * URL : /schedule-job
 * @param {message, day, time} req
 * @param {*} res
 */
export const scheduleTask = async (req, res) => {
  try {
    const { message, day, time } = req.body;
    if (!message || !day || !time)
      return sendResponse(res, {
        success: false,
        statusCode: 400,
        error: "message, day, time required",
      });

    const weekdays = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    let doc;

    if (weekdays.includes(day.toLowerCase())) {
      doc = await ScheduledMessage.create({
        message,
        day,
        time,
        type: "weekly",
        weekday: day.toLowerCase(),
      });
    } else {
      const dateTime = req.body.dateTime
      doc = await ScheduledMessage.create({
        message,
        day,
        time,
        type: "once",
        dateTime,
      });
    }

    scheduleMessageJob(doc, ScheduledMessage);
    return sendResponse(res, { success: true, statusCode: 200, data: doc });
  } catch (e) {
    console.log("scheduleTask_err", e);
    sendResponse(res, {
      success: false,
      statusCode: 500,
      error: `Error on server : ${e.toString()}`,
    });
  }
};

export const initJobs = async () => {
  try {
    const pending = await ScheduledMessage.find({ inserted: false });
    console.log(`Found ${pending.length} pending jobs to schedule...`);
    for (const job of pending) {
      scheduleMessageJob(job, ScheduledMessage);
      console.log(`Job scheduled: ${job.message}`);
    }
  } catch (e) {
    console.log("initJobs_err", e);
  }
};
