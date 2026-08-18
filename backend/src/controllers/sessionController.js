import crypto from "node:crypto";
import Session from "../models/Session.js";
import { reserveAssignment } from "../services/assignmentService.js";

const topicLabels = {
  nuclearenergy: "原子力発電",
  selfdrivingcars: "自動運転",
  surveillance: "超監視時代",
};

export async function startSession(req, res, next) {
  try {
    const assignment = await reserveAssignment();

    const sessionId = crypto.randomUUID();

    const now = new Date();

    const expiresAt = new Date(
      now.getTime() + 40 * 60 * 1000,
    );

    await Session.create({
      sessionId,
      topic: assignment.topic,
      condition: assignment.condition,
      pattern: assignment.pattern,
      status: "active",
      startedAt: now,
      expiresAt,
    });

    return res.status(201).json({
      sessionId,
      topic: assignment.topic,
      topicLabel: topicLabels[assignment.topic],
      condition: assignment.condition,
      pattern: assignment.pattern,
      expiresAt,
    });
  } catch (error) {
    if (error.message === "NO_ASSIGNMENTS_AVAILABLE") {
      return res.status(409).json({
        message: "募集人数に達しました。",
      });
    }

    if (error.message === "ASSIGNMENT_FAILED") {
      return res.status(503).json({
        message: "参加条件の割り当てに失敗しました。",
      });
    }

    next(error);
  }
}