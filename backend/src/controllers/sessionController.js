import crypto from "node:crypto";
import Session from "../Models/Session.js";
import AssignmentQuota from "../Models/AssignmentQuota.js";
import { reserveAssignment } from "../services/assignmentService.js";

const topicLabels = {
  aiCopyright: "生成AIに対する著作権規制の強化",
  aiinschool: "学校教育での生成AI利用",
  immigration: "移民受け入れ",
  underagesns: "未成年SNS利用規制",
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
     * Examples:
     *
     * News Only:
     *   topic: aiCopyright
     *   article: aiCopyright
     *   condition: news
     *   pattern: null
     *
     * MyTwoCents:
     *   topic: aiCopyright
     *   article: aiCopyright
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
     * exact experimental cell.
     */
    await AssignmentQuota.findOneAndUpdate(
      {
        article: expiredSession.article,
        condition: expiredSession.condition,
        pattern:
          expiredSession.pattern ?? null,
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