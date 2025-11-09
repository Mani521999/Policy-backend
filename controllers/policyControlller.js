import { Worker } from "worker_threads";
import { fork } from "child_process";

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import Policy from "../models/Policy.js";
import User from "../models/User.js";

import { paginationQuery, sendResponse } from "../utils/library.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Method : POST
 * URL : /upload
 * @param {file} req
 * @param {*} res
 */
export const uploadPolicy = async (req, res) => {
  try {
    if (!req.file)
      return sendResponse(res, {
        success: false,
        statusCode: 400,
        error: "File required",
      });
    const filePath = path.resolve(req.file.path);
    
    // const worker = new Worker(path.resolve(__dirname, "../worker_upload.js"), {
    //   workerData: { filePath },
    // });

    const worker = fork(path.resolve(__dirname, "../worker_upload.js"));
    worker.send({ filePath });

    worker.on("message", (msg) => {
      fs.unlinkSync(filePath);
      if (msg.status === "done")
        sendResponse(res, { success: true, statusCode: 200, data: msg.result });
      else
        sendResponse(res, {
          success: false,
          statusCode: 400,
          error: err.message,
        });
    });

    worker.on("error", (err) =>
      sendResponse(res, { success: false, statusCode: 400, error: err.message })
    );
  } catch (e) {
    console.log("uploadPolicy_err", e);
    sendResponse(res, {
      success: false,
      statusCode: 500,
      error: `Error on server : ${e.toString()}`,
    });
  }
};

/**
 * Method : GET
 * URL : /search
 * @param {username} req
 * @param {*} res
 */
export const searchPolicy = async (req, res) => {
  try {
    const { username } = req.query;
    if (!username)
      return sendResponse(res, {
        success: false,
        statusCode: 400,
        error: "Username required",
      });

    const user = await User.findOne({ firstName: new RegExp(username, "i") });
    if (!user)
      return sendResponse(res, {
        success: false,
        statusCode: 404,
        error: "User not found",
      });

    const count = await Policy.countDocuments({ user: user._id });
    const result = await Policy.find({ user: user._id })
      .populate([
        { path: "user", select: "firstName lastName email" },
        { path: "carrier", select: "company_name" },
        { path: "lob", select: "category_name" },
        { path: "agent", select: "agentName" },
      ])
      .lean();

    return sendResponse(res, {
      success: true,
      statusCode: 200,
      data: { result, count },
    }); //count
  } catch (e) {
    console.log("searchPolicy_err", e);
    sendResponse(res, {
      success: false,
      statusCode: 500,
      error: `Error on server : ${e.toString()}`,
    });
  }
};

/**
 * Method : GET
 * URL : /policy-aggregate
 * @param {page, limit} req
 * @param {*} res
 */
export const aggreateUserPolicy = async (req, res) => {
  try {
    const pagination = paginationQuery(req.query);
    const count = await Policy.countDocuments();
    const result = await Policy.aggregate([
      { $skip: pagination.skip },
      { $limit: pagination.limit },
      {
        $group: {
          _id: "$user",
          count: { $sum: 1 },
          policies: { $push: "$policyNumber" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $project: { user: "$user.firstName", count: 1, policies: 1 } },
    ]);

    return sendResponse(res, {
      success: true,
      statusCode: 200,
      data: { count, result },
    });
  } catch (e) {
    console.log("aggreateUserPolicy_err", e);
    sendResponse(res, {
      success: false,
      statusCode: 500,
      error: `Error on server : ${e.toString()}`,
    });
  }
};
