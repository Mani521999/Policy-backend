import express from "express";
const router = express.Router();
import multer from 'multer'


import { uploadPolicy, searchPolicy, aggreateUserPolicy }  from "../controllers/policyControlller.js";

const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("file"),uploadPolicy);

router.get("/search",searchPolicy);

router.get("/policy-aggregate",aggreateUserPolicy);

export default  router;
