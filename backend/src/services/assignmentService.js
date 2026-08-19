import AssignmentQuota from "../Models/AssignmentQuota.js";
import Session from "../Models/Session.js";

function selectRandom(items) {
  const randomIndex = Math.floor(
    Math.random() * items.length,
  );

  return items[randomIndex];
}

/*
 * Find active sessions whose 40-minute limit
 * has expired and record them as expired.
 */
async function releaseExpiredSessions() {
  const now = new Date();

  const expiredSessions = await Session.find({
    status: "active",
    expiresAt: {
      $lte: now,
    },
  }).lean();

  for (const session of expiredSessions) {
    /*
     * Atomically change active -> expired.
     *
     * This prevents the same session from being
     * counted as expired more than once.
     */
    const expiredSession =
      await Session.findOneAndUpdate(
        {
          _id: session._id,
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
     * If another request already expired this
     * session, do nothing.
     */
    if (!expiredSession) {
      continue;
    }

    /*
     * Record the expired participant.
     *
     * There is no reservation to release anymore.
     */
    await AssignmentQuota.findOneAndUpdate(
      {
        topic: expiredSession.topic,
        condition: expiredSession.condition,
        pattern:
          expiredSession.condition === "mytwocents"
            ? expiredSession.pattern
            : null,
      },
      {
        $inc: {
          expiredCount: 1,
        },
      },
    );
  }
}

export async function reserveAssignment() {
  /*
   * Before assigning a new participant,
   * update any sessions whose 40-minute
   * limit has expired.
   */
  await releaseExpiredSessions();

  /*
   * Find experimental cells that still need
   * valid completed responses.
   *
   * A cell remains available until its
   * completedCount reaches its target.
   */
  const availableQuotas =
    await AssignmentQuota.find({
      $expr: {
        $lt: [
          "$completedCount",
          "$target",
        ],
      },
    }).lean();

  if (availableQuotas.length === 0) {
    throw new Error(
      "NO_ASSIGNMENTS_AVAILABLE",
    );
  }

  /*
   * Find the least-filled cells proportionally
   * using valid completed responses.
   *
   * Example:
   *
   * News:
   * 5 / 25 = 20%
   *
   * P01:
   * 1 / 5 = 20%
   *
   * These are treated as equally filled.
   */
  const minimumFillRatio = Math.min(
    ...availableQuotas.map(
      (quota) =>
        quota.completedCount /
        quota.target,
    ),
  );

  /*
   * Keep only cells with the minimum
   * completion ratio.
   */
  const leastFilledQuotas =
    availableQuotas.filter(
      (quota) =>
        quota.completedCount /
          quota.target ===
        minimumFillRatio,
    );

  /*
   * Randomly choose among tied cells.
   */
  const selectedQuota =
    selectRandom(
      leastFilledQuotas,
    );

  /*
   * Starting the questionnaire does NOT
   * increase any quota counter.
   *
   * completedCount will only increase after
   * a participant successfully completes the
   * questionnaire and passes the attention check.
   */
  return {
    topic: selectedQuota.topic,
    condition:
      selectedQuota.condition,
    pattern:
      selectedQuota.pattern,
  };
}