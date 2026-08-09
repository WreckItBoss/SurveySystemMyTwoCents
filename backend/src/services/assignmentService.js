import AssignmentQuota from "../Models/AssignmentQuota.js";

function selectRandom(items) {
  const randomIndex = Math.floor(Math.random() * items.length);
  return items[randomIndex];
}

export async function reserveAssignment() {
  /*
   * Retry a few times because another participant may reserve
   * the same least-filled quota between our read and update.
   */
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const availableQuotas = await AssignmentQuota.find({
      $expr: {
        $lt: ["$reservedCount", "$target"],
      },
    }).lean();

    if (availableQuotas.length === 0) {
      throw new Error("NO_ASSIGNMENTS_AVAILABLE");
    }

    /*
     * Find the smallest current participant count ratio wise.
     */
  const minimumFillRatio = Math.min(
    ...availableQuotas.map(
      (quota) => quota.reservedCount / quota.target,
    ),
  );

    /*
     * Keep only the groups that currently have that minimum.
     */
  const leastFilledQuotas = availableQuotas.filter(
    (quota) =>
      quota.reservedCount / quota.target === minimumFillRatio,
  );

    /*
     * Randomly choose among equally filled groups.
     */
    const selectedQuota = selectRandom(
      leastFilledQuotas,
    );

    /*
     * Atomically reserve one place.
     *
     * The condition reservedCount < target and the $inc happen
     * as one MongoDB operation.
     */
    const reservedQuota =
      await AssignmentQuota.findOneAndUpdate(
        {
          _id: selectedQuota._id,
          reservedCount: {
            $lt: selectedQuota.target,
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
     * If another participant took the final slot just before us,
     * reservedQuota will be null. In that case, loop and try again.
     */
    if (!reservedQuota) {
      continue;
    }

    return {
      topic: reservedQuota.topic,
      condition: reservedQuota.condition,
      pattern: reservedQuota.pattern,
    };
  }

  throw new Error("ASSIGNMENT_FAILED");
}