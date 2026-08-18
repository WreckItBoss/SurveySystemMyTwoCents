import express from "express";
import {
  startSession,
  expireSession,
} from "../controllers/sessionController.js";

const router = express.Router();

router.post("/start", startSession);

router.post(
  "/:sessionId/expire",
  expireSession,
);

export default router;