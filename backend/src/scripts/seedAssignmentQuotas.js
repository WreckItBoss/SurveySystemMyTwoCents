import "dotenv/config";
import mongoose from "mongoose";

import connectDatabase from "../config/database.js";
import AssignmentQuota from "../Models/AssignmentQuota.js";

const quotas = [
  {
    topic: "nuclearenergy",
    article: "nuclearenergy1",
  },
  {
    topic: "nuclearenergy",
    article: "nuclearenergy2",
  },

  {
    topic: "immigration",
    article: "immigration1",
  },
  {
    topic: "immigration",
    article: "immigration2",
  },

  {
    topic: "usingballatpark",
    article: "usingballatpark1",
  },
  {
    topic: "usingballatpark",
    article: "usingballatpark2",
  },

  {
    topic: "casinoir",
    article: "casinoir1",
  },
  {
    topic: "casinoir",
    article: "casinoir2",
  },

  {
    topic: "decreasericeprice",
    article: "decreasericeprice1",
  },
  {
    topic: "decreasericeprice",
    article: "decreasericeprice2",
  },
].map((quota) => ({
  ...quota,
  target: 25,
  completedCount: 0,
  incorrectCount: 0,
  expiredCount: 0,
}));

async function seedAssignmentQuotas() {
  try {
    await connectDatabase();

    /*
     * Remove all old quota documents.
     */
    await AssignmentQuota.deleteMany({});

    /*
     * Synchronize MongoDB indexes with the
     * CURRENT AssignmentQuota schema.
     *
     * This removes the old:
     *
     * topic_1_condition_1_pattern_1
     *
     * index and creates/keeps the new:
     *
     * article_1
     *
     * unique index.
     */
    await AssignmentQuota.syncIndexes();

    /*
     * Insert the 10 article quotas.
     */
    await AssignmentQuota.insertMany(quotas);

    console.log(
      `Inserted ${quotas.length} assignment quota documents.`,
    );

    console.log(
      `Total target: ${quotas.reduce(
        (sum, quota) => sum + quota.target,
        0,
      )} valid participants.`,
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