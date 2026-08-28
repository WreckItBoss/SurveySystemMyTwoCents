import crypto from "node:crypto";
import Session from "../Models/Session.js";
import AssignmentQuota from "../Models/AssignmentQuota.js";
import { reserveAssignment } from "../services/assignmentService.js";

const topicLabels = {
  nuclearenergy: "原子力発電",
  casinoir: "カジノ・IR",
};

export async function startSession(
  req,
  res,
  next,
) {
  try {
    const assignment =
      await reserveAssignment();

    const sessionId =
      crypto.randomUUID();

    const now = new Date();

    const expiresAt = new Date(
      now.getTime() + 40 * 60 * 1000,
    );

    /*
     * Store the exact experimental cell
     * assigned to this participant.
     *
     * Example:
     *   topic: nuclearenergy
     *   article: nuclearenergy1
     *   condition: mytwocents
     *   pattern: P03
     */
    await Session.create({
      sessionId,
      topic: assignment.topic,
      article: assignment.article,
      condition: assignment.condition,
      pattern: assignment.pattern,
      status: "active",
      startedAt: now,
      expiresAt,
    });

    return res.status(201).json({
      sessionId,
      topic: assignment.topic,
      topicLabel:
        topicLabels[assignment.topic],
      article: assignment.article,
      condition: assignment.condition,
      pattern: assignment.pattern,
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
     * Atomically change the session from
     * active -> expired.
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
     * The session may already have been
     * completed or expired.
     */
    if (!expiredSession) {
      return res.status(200).json({
        expired: false,
      });
    }

    /*
     * Increment the expired count for the
     * exact article + pattern cell.
     */
    await AssignmentQuota.findOneAndUpdate(
      {
        article: expiredSession.article,
        pattern: expiredSession.pattern,
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