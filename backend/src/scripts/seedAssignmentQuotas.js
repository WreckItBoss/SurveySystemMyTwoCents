import "dotenv/config";
import mongoose from "mongoose";

import connectDatabase from "../config/database.js";
import AssignmentQuota from "../Models/AssignmentQuota.js";

const patterns = [
  "P01",
  "P02",
  "P03",
  "P04",
  "P05",
];

const articles = [
  {
    topic: "nuclearenergy",
    article: "nuclearenergy1",
  },
  {
    topic: "casinoir",
    article: "casinoir2",
  },
];

/*
 * Create:
 *
 * nuclearenergy1 × P01-P05
 * casinoir2      × P01-P05
 *
 * 10 experimental cells total.
 */
const quotas = articles.flatMap(
  ({ topic, article }) =>
    patterns.map((pattern) => ({
      topic,
      article,
      condition: "mytwocents",
      pattern,
      target: 5,
      completedCount: 0,
      incorrectCount: 0,
      expiredCount: 0,
    })),
);

async function seedAssignmentQuotas() {
  try {
    await connectDatabase();

    /*
     * Remove quota documents from the
     * previous News Only experiment.
     */
    await AssignmentQuota.deleteMany({});

    /*
     * Synchronize MongoDB indexes with the
     * CURRENT AssignmentQuota schema.
     *
     * The previous News Only experiment used:
     *
     *   article_1
     *
     * The current experiment uses:
     *
     *   article_1_pattern_1
     *
     * as the unique experimental-cell index.
     */
    await AssignmentQuota.syncIndexes();

    /*
     * Insert the 10 article + pattern quotas.
     */
    await AssignmentQuota.insertMany(
      quotas,
    );

    console.log(
      `Inserted ${quotas.length} assignment quota documents.`,
    );

    console.log(
      `Total target: ${quotas.reduce(
        (sum, quota) =>
          sum + quota.target,
        0,
      )} valid participants.`,
    );

    console.table(
      quotas.map((quota) => ({
        topic: quota.topic,
        article: quota.article,
        pattern: quota.pattern,
        target: quota.target,
      })),
    );
  } catch (error) {
    console.error(
      "Failed to seed assignment quotas:",
    );

    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
}

seedAssignmentQuotas();