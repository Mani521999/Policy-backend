import express from "express";
const router = express.Router();

import { scheduleTask } from "../controllers/scheduleController.js";
import { scheduleValidation } from "../utils/validator.js";

router.post("/schedule-job",scheduleTask);

export default router;
