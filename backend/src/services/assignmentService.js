import AssignmentQuota from "../Models/AssignmentQuota.js";
import Session from "../Models/Session.js";

function selectRandom(items) {
  const randomIndex = Math.floor(
    Math.random() * items.length,
  );

  return items[randomIndex];
}

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

function getCellKey(
  article,
  condition,
  pattern,
) {
  return `${article}:${condition}:${pattern ?? "none"}`;
}

async function releaseExpiredSessions() {
  const now = new Date();

  const expiredSessions = await Session.find({
    status: "active",
    expiresAt: {
      $lte: now,
    },
  }).lean();

  for (const session of expiredSessions) {
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

    if (!expiredSession) {
      continue;
    }

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
 * STEP 1: SELECT TOPIC / ARTICLE
 * ==================================================
 *
 * Balance the four topics first.
 */
function selectArticle(
  quotas,
  activeCounts,
) {
  const articles = [
    ...new Set(
      quotas.map(
        (quota) => quota.article,
      ),
    ),
  ];

  return selectLowestScore(
    articles,
    (article) => {
      const articleQuotas =
        quotas.filter(
          (quota) =>
            quota.article === article,
        );

      const currentTotal =
        articleQuotas.reduce(
          (total, quota) =>
            total +
            getCurrentCount(
              quota,
              activeCounts,
            ),
          0,
        );

      const targetTotal =
        articleQuotas.reduce(
          (total, quota) =>
            total + quota.target,
          0,
        );

      return (
        currentTotal /
        targetTotal
      );
    },
  );
}

/*
 * ==================================================
 * STEP 2: SELECT CONDITION / PATTERN CELL
 * ==================================================
 *
 * Within the selected article, compare:
 *
 *   News Only
 *   P01
 *   P02
 *   P03
 *   P04
 *   P05
 *
 * using:
 *
 *   completed + active
 *   ------------------
 *         target
 */
function selectCell(
  quotas,
  activeCounts,
  article,
) {
  const articleQuotas =
    quotas.filter(
      (quota) =>
        quota.article === article,
    );

  if (articleQuotas.length === 0) {
    throw new Error(
      `ARTICLE_QUOTA_NOT_FOUND:${article}`,
    );
  }

  return selectLowestScore(
    articleQuotas,
    (quota) =>
      getCurrentCount(
        quota,
        activeCounts,
      ) /
      quota.target,
  );
}

export async function reserveAssignment() {
  await releaseExpiredSessions();

  const quotas =
    await AssignmentQuota.find({}).lean();

  if (quotas.length === 0) {
    throw new Error(
      "NO_ASSIGNMENTS_CONFIGURED",
    );
  }

  const activeCounts =
    await getActiveCounts();

  /*
   * STEP 1
   * Balance topic/article first.
   */
  const selectedArticle =
    selectArticle(
      quotas,
      activeCounts,
    );

  /*
   * STEP 2
   * Within that article,
   * balance News vs P01-P05
   * according to their target ratios.
   */
  const selectedQuota =
    selectCell(
      quotas,
      activeCounts,
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