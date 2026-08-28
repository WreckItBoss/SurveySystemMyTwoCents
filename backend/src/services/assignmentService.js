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
 * Example:
 *   casinoir2 + P01
 *   nuclearenergy1 + P03
 */
function getCellKey(article, pattern) {
  return `${article}:${pattern}`;
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
  }
}

/*
 * Count currently active, non-expired sessions
 * for each article + pattern cell.
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
          condition: "mytwocents",
        },
      },
      {
        $group: {
          _id: {
            article: "$article",
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
    /*
     * Ignore old/incomplete sessions that
     * do not have article or pattern.
     */
    if (
      !item._id?.article ||
      !item._id?.pattern
    ) {
      continue;
    }

    const key = getCellKey(
      item._id.article,
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
 * for a specific article + pattern cell.
 */
function getActiveCount(
  quota,
  activeCounts,
) {
  const key = getCellKey(
    quota.article,
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
   * Load all 10 article + pattern quotas.
   *
   * 2 articles × 5 patterns = 10 cells.
   *
   * IMPORTANT:
   * We deliberately do NOT filter using
   * completedCount < target.
   *
   * The target is used for balancing rather
   * than as a hard reservation wall.
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
   * answering each article + pattern cell.
   */
  const activeCounts =
    await getActiveCounts();

  /*
   * ==================================================
   * CHOOSE ARTICLE + PATTERN
   * ==================================================
   *
   * Each article + pattern combination is
   * one experimental cell.
   *
   * Balancing score:
   *
   *   completed + active
   *   ------------------
   *         target
   *
   * Example:
   *
   * casinoir2 / P01:
   *   completed = 3
   *   active    = 1
   *   target    = 5
   *
   *   score = 4 / 5 = 0.8
   *
   * casinoir2 / P02:
   *   completed = 2
   *   active    = 0
   *   target    = 5
   *
   *   score = 2 / 5 = 0.4
   *
   * P02 therefore has higher priority.
   *
   * If multiple cells have the same lowest
   * score, randomly choose between them.
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

  /*
   * Every participant in this experiment
   * receives the MyTwoCents condition.
   */
  return {
    topic: selectedQuota.topic,
    article: selectedQuota.article,
    condition: "mytwocents",
    pattern: selectedQuota.pattern,
  };
}