import crypto from "node:crypto";
import Session from "../Models/Session.js";
import AssignmentQuota from "../Models/AssignmentQuota.js";
import { reserveAssignment } from "../services/assignmentService.js";

const topicLabels = {
  nuclearenergy: "原子力発電",
  immigration: "移民受け入れ",
  usingballatpark: "公園でのボール遊び",
  casinoir: "カジノ・IR",
  decreasericeprice: "コメ価格の値下がり",
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
      article: assignment.article,
      condition: "news",
      pattern: null,
      status: "active",
      startedAt: now,
      expiresAt,
    });

    return res.status(201).json({
      sessionId,
      topic: assignment.topic,
      topicLabel: topicLabels[assignment.topic],
      article: assignment.article,
      condition: "news",
      pattern: null,
      expiresAt,
    });
  } catch (error) {
    if (
      error.message ===
      "NO_ASSIGNMENTS_CONFIGURED"
    ) {
      return res.status(503).json({
        message:
          "実験条件が設定されていません。",
      });
    }

    next(error);
  }
}

export async function expireSession(
  req,
  res,
  next,
) {
  try {
    const { sessionId } = req.params;

    /*
     * Only expire a session that is still active.
     *
     * If it was already completed or expired,
     * it must not be counted again.
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
     * If the session was already completed/expired
     * or doesn't exist, do nothing.
     */
    if (!expiredSession) {
      return res.status(200).json({
        expired: false,
      });
    }

    /*
     * Record the expired participant for the
     * exact article they were assigned.
     */
    await AssignmentQuota.findOneAndUpdate(
      {
        article: expiredSession.article,
      },
      {
        $inc: {
          expiredCount: 1,
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