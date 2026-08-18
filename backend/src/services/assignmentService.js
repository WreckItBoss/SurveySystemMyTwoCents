import AssignmentQuota from "../Models/AssignmentQuota.js";
import Session from "../Models/Session.js";

function selectRandom(items) {
  const randomIndex = Math.floor(
    Math.random() * items.length,
  );

  return items[randomIndex];
}

/*
 * Find sessions whose 40-minute reservation has expired
 * and release the quota slot they were occupying.
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
     * This is important because two requests could try to
     * expire the same session at the same time.
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
     * If another request already expired this session,
     * do nothing.
     */
    if (!expiredSession) {
      continue;
    }

    /*
     * Release the quota reservation and record
     * the expired participant.
     *
     * reservedCount -1
     * expiredCount  +1
     */
    await AssignmentQuota.findOneAndUpdate(
      {
        topic: expiredSession.topic,
        condition: expiredSession.condition,
        pattern:
          expiredSession.condition === "mytwocents"
            ? expiredSession.pattern
            : null,

        // Safety check so reservedCount never becomes negative.
        reservedCount: {
          $gt: 0,
        },
      },
      {
        $inc: {
          reservedCount: -1,
          expiredCount: 1,
        },
      },
    );
  }
}

export async function reserveAssignment() {
  /*
   * Before assigning a new participant,
   * free reservations belonging to sessions
   * whose 40-minute limit has expired.
   */
  await releaseExpiredSessions();

  /*
   * Retry because another participant may reserve
   * the same least-filled quota between our read
   * and atomic update.
   */
  for (
    let attempt = 0;
    attempt < 10;
    attempt += 1
  ) {
    const availableQuotas =
      await AssignmentQuota.find({
        $expr: {
          $lt: [
            "$reservedCount",
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
     * Find the least-filled quota proportionally.
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
          quota.reservedCount /
          quota.target,
      ),
    );

    /*
     * Keep only quotas with the minimum
     * current fill ratio.
     */
    const leastFilledQuotas =
      availableQuotas.filter(
        (quota) =>
          quota.reservedCount /
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
     * Atomically reserve one slot.
     */
    const reservedQuota =
      await AssignmentQuota.findOneAndUpdate(
        {
          _id: selectedQuota._id,

          reservedCount: {
            $lt:
              selectedQuota.target,
          },
        },
        {
          $inc: {
            reservedCount: 1,
          },
        },
        {
          new: true,
        },
      );

    /*
     * Another participant may have taken
     * the final available slot.
     */
    if (!reservedQuota) {
      continue;
    }

    return {
      topic: reservedQuota.topic,
      condition:
        reservedQuota.condition,
      pattern:
        reservedQuota.pattern,
    };
  }

  throw new Error(
    "ASSIGNMENT_FAILED",
  );
}