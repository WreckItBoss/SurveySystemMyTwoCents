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
    topic: "aiCopyright",
    article: "aiCopyright",
  },
  {
    topic: "aiinschool",
    article: "aiinschool",
  },
  {
    topic: "immigration",
    article: "immigration",
  },
  {
    topic: "underagesns",
    article: "underagesns",
  },
];

/*
 * Create:
 *
 * News Only:
 * 4 articles × 1 condition
 *
 * MyTwoCents:
 * 4 articles × P01-P05
 *
 * 24 experimental cells total.
 */

const newsQuotas = articles.map(
  ({ topic, article }) => ({
    topic,
    article,
    condition: "news",
    pattern: null,
    target: 5,
    completedCount: 0,
    incorrectCount: 0,
    expiredCount: 0,
  }),
);

const myTwoCentsQuotas = articles.flatMap(
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

const quotas = [
  ...newsQuotas,
  ...myTwoCentsQuotas,
];

async function seedAssignmentQuotas() {
  try {
    await connectDatabase();

    /*
     * Remove old quota documents.
     */
    await AssignmentQuota.deleteMany({});

    /*
     * Synchronize MongoDB indexes with the
     * current AssignmentQuota schema.
     *
     * Current unique experimental-cell index:
     *
     * article + condition + pattern
     */
    await AssignmentQuota.syncIndexes();

    /*
     * Insert all 24 experimental cells.
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
        condition: quota.condition,
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