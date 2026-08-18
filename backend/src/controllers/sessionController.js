import crypto from "node:crypto";
import Session from "../Models/Session.js";
import AssignmentQuota from "../Models/AssignmentQuota.js";
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

export async function expireSession(req, res, next) {
  try {
    const { sessionId } = req.params;

    /*
     * Only expire a session that is still active.
     *
     * If it was already completed or already expired,
     * nothing should be released again.
     */
    const expiredSession =
      await Session.findOneAndUpdate(
        {
          sessionId,
          status: "active",
        },
        {
          $set: {
            status: "expired",
          },
        },
        {
          new: true,
        },
      );

    /*
     * If the session is already completed/expired
     * or doesn't exist, do nothing.
     */
    if (!expiredSession) {
      return res.status(200).json({
        expired: false,
      });
    }

    const normalizedPattern =
      expiredSession.condition === "mytwocents"
        ? expiredSession.pattern
        : null;

    /*
     * Release the quota slot immediately.
     */
    await AssignmentQuota.findOneAndUpdate(
      {
        topic: expiredSession.topic,
        condition: expiredSession.condition,
        pattern: normalizedPattern,

        reservedCount: {
          $gt: 0,
        },
      },
      {
        $inc: {
          reservedCount: -1,
        },
      },
    );

    return res.status(200).json({
      expired: true,
    });
  } catch (error) {
    next(error);
  }
}