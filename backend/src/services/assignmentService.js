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
     * There is no reservation to release.
     */
    await AssignmentQuota.findOneAndUpdate(
      {
        topic: expiredSession.topic,
        condition:
          expiredSession.condition,
        pattern:
          expiredSession.condition ===
          "mytwocents"
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

/*
 * Count currently active, non-expired sessions
 * for every experimental cell.
 *
 * Active participants are used only as a
 * temporary balancing signal.
 */
async function getActiveCounts() {
  const now = new Date();

  const activeSessions = await Session.aggregate([
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
          topic: "$topic",
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
    const key = [
      item._id.topic,
      item._id.condition,
      item._id.pattern ?? "null",
    ].join("|");

    activeCounts.set(
      key,
      item.count,
    );
  }

  return activeCounts;
}

/*
 * Get the active count for one quota cell.
 */
function getActiveCount(
  quota,
  activeCounts,
) {
  const key = [
    quota.topic,
    quota.condition,
    quota.pattern ?? "null",
  ].join("|");

  return activeCounts.get(key) ?? 0;
}

export async function reserveAssignment() {
  /*
   * First remove expired sessions from the
   * active population.
   */
  await releaseExpiredSessions();

  /*
   * Load every experimental quota.
   *
   * IMPORTANT:
   * We do NOT filter by completedCount < target.
   *
   * Targets are balancing targets, not
   * hard capacity limits.
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
   * answering the questionnaire.
   */
  const activeCounts =
    await getActiveCounts();

  /*
   * ==================================================
   * STEP 1: CHOOSE TOPIC
   * ==================================================
   *
   * Each topic has a desired total equal to the
   * sum of all quota targets belonging to it.
   *
   * Current population is:
   *
   * completed valid responses
   * +
   * currently active participants
   */
  const topicNames = [
    ...new Set(
      quotas.map(
        (quota) => quota.topic,
      ),
    ),
  ];

  const topicStats =
    topicNames.map((topic) => {
      const topicQuotas =
        quotas.filter(
          (quota) =>
            quota.topic === topic,
        );

      const target =
        topicQuotas.reduce(
          (sum, quota) =>
            sum + quota.target,
          0,
        );

      const completed =
        topicQuotas.reduce(
          (sum, quota) =>
            sum +
            quota.completedCount,
          0,
        );

      const active =
        topicQuotas.reduce(
          (sum, quota) =>
            sum +
            getActiveCount(
              quota,
              activeCounts,
            ),
          0,
        );

      return {
        topic,
        target,
        completed,
        active,
      };
    });

  const selectedTopic =
    selectLowestScore(
      topicStats,
      (item) =>
        (item.completed +
          item.active) /
        item.target,
    );

  /*
   * ==================================================
   * STEP 2: CHOOSE CONDITION
   * ==================================================
   *
   * Within the selected topic, compare:
   *
   * News
   *       vs.
   * MyTwoCents as a WHOLE
   *
   * We deliberately do NOT compare News against
   * each individual MyTwoCents pattern.
   */
  const topicQuotas =
    quotas.filter(
      (quota) =>
        quota.topic ===
        selectedTopic.topic,
    );

  const conditions = [
    ...new Set(
      topicQuotas.map(
        (quota) =>
          quota.condition,
      ),
    ),
  ];

  const conditionStats =
    conditions.map((condition) => {
      const conditionQuotas =
        topicQuotas.filter(
          (quota) =>
            quota.condition ===
            condition,
        );

      const target =
        conditionQuotas.reduce(
          (sum, quota) =>
            sum + quota.target,
          0,
        );

      const completed =
        conditionQuotas.reduce(
          (sum, quota) =>
            sum +
            quota.completedCount,
          0,
        );

      const active =
        conditionQuotas.reduce(
          (sum, quota) =>
            sum +
            getActiveCount(
              quota,
              activeCounts,
            ),
          0,
        );

      return {
        condition,
        target,
        completed,
        active,
      };
    });

  const selectedCondition =
    selectLowestScore(
      conditionStats,
      (item) =>
        (item.completed +
          item.active) /
        item.target,
    );

  /*
   * ==================================================
   * STEP 3A: NEWS
   * ==================================================
   *
   * News has no conversation pattern.
   */
  if (
    selectedCondition.condition ===
    "news"
  ) {
    return {
      topic: selectedTopic.topic,
      condition: "news",
      pattern: null,
    };
  }

  /*
   * ==================================================
   * STEP 3B: MYTWOCENTS PATTERN
   * ==================================================
   *
   * Only after MyTwoCents has been selected do
   * we compare P01-P05.
   */
  const patternQuotas =
    topicQuotas.filter(
      (quota) =>
        quota.condition ===
        "mytwocents",
    );

  const selectedPattern =
    selectLowestScore(
      patternQuotas,
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
    topic: selectedTopic.topic,
    condition: "mytwocents",
    pattern: selectedPattern.pattern,
  };
}