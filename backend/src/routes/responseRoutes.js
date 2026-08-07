import express from "express";
import { createResponse } from "../controllers/responseController.js";

const router = express.Router();

router.post("/", createResponse);

export default router;