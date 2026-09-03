import AssignmentQuota from "../Models/AssignmentQuota.js";
import Session from "../Models/Session.js";

function selectRandom(items) {
  const randomIndex = Math.floor(
    Math.random() * items.length,
  );

  return items[randomIndex];
}

/*
 * Randomly choose one item among those
 * with the lowest score.
 */
function selectLowestScore(
  items,
  getScore,
) {
  const minimumScore = Math.min(
    ...items.map(getScore),
  );

  const lowestItems = items.filter(
    (item) =>
      getScore(item) === minimumScore,
  );

  return selectRandom(lowestItems);
}

/*
 * Create a unique key for one experimental cell.
 *
 * Examples:
 *   aiCopyright + news + null
 *   aiCopyright + mytwocents + P01
 */
function getCellKey(
  article,
  condition,
  pattern,
) {
  return `${article}:${condition}:${pattern ?? "none"}`;
}

/*
 * Find active sessions whose time limit
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
     * This prevents the same session from
     * being counted as expired more than once.
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
     * Record the expired participant for the
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
  }
}

/*
 * Count currently active, non-expired sessions
 * for each experimental cell.
 *
 * Active participants are used only as a
 * temporary balancing signal.
 */
async function getActiveCounts() {
  const now = new Date();

  const activeSessions =
    await Session.aggregate([
      {
        $match: {
          status: "active",
          expiresAt: {
            $gt: now,
          },
        },
      },
      {
        $group: {
          _id: {
            article: "$article",
            condition: "$condition",
            pattern: "$pattern",
          },
          count: {
            $sum: 1,
          },
        },
      },
    ]);

  const activeCounts = new Map();

  for (const item of activeSessions) {
    if (
      !item._id?.article ||
      !item._id?.condition
    ) {
      continue;
    }

    const key = getCellKey(
      item._id.article,
      item._id.condition,
      item._id.pattern,
    );

    activeCounts.set(
      key,
      item.count,
    );
  }

  return activeCounts;
}

/*
 * Get the active participant count
 * for a specific experimental cell.
 */
function getActiveCount(
  quota,
  activeCounts,
) {
  const key = getCellKey(
    quota.article,
    quota.condition,
    quota.pattern,
  );

  return activeCounts.get(key) ?? 0;
}

export async function reserveAssignment() {
  /*
   * First update sessions whose time limit
   * has expired.
   */
  await releaseExpiredSessions();

  /*
   * Load all assignment quotas.
   *
   * News Only:
   * 4 articles × 1 cell = 4 cells
   *
   * MyTwoCents:
   * 4 articles × 5 patterns = 20 cells
   *
   * 24 experimental cells total.
   */
  const quotas =
    await AssignmentQuota.find({}).lean();

  if (quotas.length === 0) {
    throw new Error(
      "NO_ASSIGNMENTS_CONFIGURED",
    );
  }

  /*
   * Count participants who are currently
   * answering each experimental cell.
   */
  const activeCounts =
    await getActiveCounts();

  /*
   * Balancing score:
   *
   *   completed + active
   *   ------------------
   *         target
   *
   * News Only target = 25
   * MyTwoCents pattern target = 5
   *
   * This keeps:
   *
   * News Only = 25 per article
   * MyTwoCents = 5 per pattern
   */
  const selectedQuota =
    selectLowestScore(
      quotas,
      (quota) =>
        (
          quota.completedCount +
          getActiveCount(
            quota,
            activeCounts,
          )
        ) /
        quota.target,
    );

  return {
    topic: selectedQuota.topic,
    article: selectedQuota.article,
    condition: selectedQuota.condition,
    pattern:
      selectedQuota.pattern ?? null,
  };
}