import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./db/index.js";
import "./models/index.js";

import policyRoutes from './routes/policyRoutes.js'
import scheduleRoutes from './routes/scheduleRoutes.js'

import { initJobs } from "./controllers/scheduleController.js";


const app = express();
app.use(bodyParser.json());

app.use("/api/policy", policyRoutes);
app.use("/api/schedule", scheduleRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("server running with", PORT);
    connectDB() //  Database Connection.
    initJobs()
});
