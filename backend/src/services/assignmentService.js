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
  }
}

/*
 * Count currently active, non-expired sessions
 * for each article.
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
          _id: "$article",
          count: {
            $sum: 1,
          },
        },
      },
    ]);

  const activeCounts = new Map();

  for (const item of activeSessions) {
    /*
     * Ignore old sessions that do not have
     * an article field.
     */
    if (!item._id) {
      continue;
    }

    activeCounts.set(
      item._id,
      item.count,
    );
  }

  return activeCounts;
}

/*
 * Get the active participant count
 * for a specific article.
 */
function getActiveCount(
  quota,
  activeCounts,
) {
  return (
    activeCounts.get(quota.article) ?? 0
  );
}

export async function reserveAssignment() {
  /*
   * First update sessions whose time limit
   * has expired.
   */
  await releaseExpiredSessions();

  /*
   * Load all 10 article quotas.
   *
   * IMPORTANT:
   * We deliberately do NOT filter using
   * completedCount < target.
   *
   * The target is used for balancing rather
   * than as a hard reservation wall.
   *
   * This means participants who are already
   * entering/completing the questionnaire
   * are not blocked simply because another
   * participant finishes first.
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
   * answering each article.
   */
  const activeCounts =
    await getActiveCounts();

  /*
   * ==================================================
   * CHOOSE ARTICLE
   * ==================================================
   *
   * Each article is now one experimental cell.
   *
   * Balancing score:
   *
   *   completed + active
   *   ------------------
   *         target
   *
   * Example:
   *
   * nuclearenergy1:
   *   completed = 10
   *   active    = 2
   *   target    = 25
   *
   *   score = 12 / 25 = 0.48
   *
   * casinoir2:
   *   completed = 8
   *   active    = 1
   *   target    = 25
   *
   *   score = 9 / 25 = 0.36
   *
   * casinoir2 therefore has higher priority.
   *
   * If multiple articles have the same lowest
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
   * Every participant in this temporary
   * experiment receives the News Only
   * condition.
   *
   * pattern remains null for compatibility
   * with the existing application.
   */
  return {
    topic: selectedQuota.topic,
    article: selectedQuota.article,
    condition: "news",
    pattern: null,
  };
}