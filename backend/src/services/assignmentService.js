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
        article:
          expiredSession.article,

        condition:
          expiredSession.condition,

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

/*
 * Get the current participant count
 * for a specific experimental cell.
 *
 * We count:
 *
 *   completed + currently active
 *
 * Incorrect and expired participants
 * do not count toward the target.
 */
function getCurrentCount(
  quota,
  activeCounts,
) {
  return (
    quota.completedCount +
    getActiveCount(
      quota,
      activeCounts,
    )
  );
}

/*
 * ==================================================
 * STEP 1: SELECT CONDITION
 * ==================================================
 *
 * First balance:
 *
 *   News Only
 *        vs
 *   MyTwoCents
 *
 * Expected final totals:
 *
 *   News Only   = 100
 *   MyTwoCents  = 100
 */
function selectCondition(
  quotas,
  activeCounts,
) {
  const conditions = [
    "news",
    "mytwocents",
  ];

  return selectLowestScore(
    conditions,
    (condition) => {
      const conditionQuotas =
        quotas.filter(
          (quota) =>
            quota.condition ===
            condition,
        );

      return conditionQuotas.reduce(
        (total, quota) =>
          total +
          getCurrentCount(
            quota,
            activeCounts,
          ),
        0,
      );
    },
  );
}

/*
 * ==================================================
 * STEP 2: SELECT ARTICLE / TOPIC
 * ==================================================
 *
 * After selecting the condition,
 * balance the four articles within
 * that condition.
 *
 * Example:
 *
 * MyTwoCents:
 *
 *   aiCopyright   = 10
 *   aiinschool    = 11
 *   immigration   = 12
 *   underagesns   = 11
 *
 * -> aiCopyright is selected.
 */
function selectArticle(
  quotas,
  activeCounts,
  condition,
) {
  const conditionQuotas =
    quotas.filter(
      (quota) =>
        quota.condition === condition,
    );

  const articles = [
    ...new Set(
      conditionQuotas.map(
        (quota) => quota.article,
      ),
    ),
  ];

  return selectLowestScore(
    articles,
    (article) => {
      const articleQuotas =
        conditionQuotas.filter(
          (quota) =>
            quota.article === article,
        );

      return articleQuotas.reduce(
        (total, quota) =>
          total +
          getCurrentCount(
            quota,
            activeCounts,
          ),
        0,
      );
    },
  );
}

/*
 * ==================================================
 * STEP 3: SELECT EXACT CELL
 * ==================================================
 *
 * News Only:
 *   article + news + null
 *
 * MyTwoCents:
 *   article + mytwocents + P01-P05
 */
function selectExperimentalCell(
  quotas,
  activeCounts,
  condition,
  article,
) {
  /*
   * News Only has no conversation pattern.
   */
  if (condition === "news") {
    const newsQuota =
      quotas.find(
        (quota) =>
          quota.condition === "news" &&
          quota.article === article &&
          quota.pattern == null,
      );

    if (!newsQuota) {
      throw new Error(
        `NEWS_QUOTA_NOT_FOUND:${article}`,
      );
    }

    return newsQuota;
  }

  /*
   * MyTwoCents:
   *
   * Within the selected article,
   * select the pattern with the fewest
   * completed + active participants.
   */
  const patternQuotas =
    quotas.filter(
      (quota) =>
        quota.condition ===
          "mytwocents" &&
        quota.article === article,
    );

  if (patternQuotas.length === 0) {
    throw new Error(
      `MYTWOCENTS_QUOTA_NOT_FOUND:${article}`,
    );
  }

  return selectLowestScore(
    patternQuotas,
    (quota) =>
      getCurrentCount(
        quota,
        activeCounts,
      ),
  );
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
   *   4 articles × 1 cell
   *   = 4 cells
   *
   * MyTwoCents:
   *   4 articles × 5 patterns
   *   = 20 cells
   *
   * Total:
   *   24 experimental cells
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
   * ==================================================
   * HIERARCHICAL ASSIGNMENT
   * ==================================================
   *
   * STEP 1
   * Balance experimental condition:
   *
   *   News Only
   *        vs
   *   MyTwoCents
   */
  const selectedCondition =
    selectCondition(
      quotas,
      activeCounts,
    );

  /*
   * STEP 2
   * Within the selected condition,
   * balance the four articles/topics.
   */
  const selectedArticle =
    selectArticle(
      quotas,
      activeCounts,
      selectedCondition,
    );

  /*
   * STEP 3
   *
   * News Only:
   *   pattern = null
   *
   * MyTwoCents:
   *   balance P01-P05 within
   *   the selected article.
   */
  const selectedQuota =
    selectExperimentalCell(
      quotas,
      activeCounts,
      selectedCondition,
      selectedArticle,
    );

  return {
    topic:
      selectedQuota.topic,

    article:
      selectedQuota.article,

    condition:
      selectedQuota.condition,

    pattern:
      selectedQuota.pattern ?? null,
  };
}