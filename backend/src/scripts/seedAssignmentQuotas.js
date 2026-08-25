import "dotenv/config";
import mongoose from "mongoose";

import connectDatabase from "../config/database.js";
import AssignmentQuota from "../Models/AssignmentQuota.js";

/*
 * Temporary News-Only article-selection experiment.
 *
 * 5 topics
 * × 2 articles per topic
 * = 10 article conditions
 *
 * Each article targets 25 valid participants.
 */

const quotas = [
  {
    topic: "nuclearenergy",
    article: "nuclearenergy1",
    target: 25,
  },
  {
    topic: "nuclearenergy",
    article: "nuclearenergy2",
    target: 25,
  },

  {
    topic: "immigration",
    article: "immigration1",
    target: 25,
  },
  {
    topic: "immigration",
    article: "immigration2",
    target: 25,
  },

  {
    topic: "usingballatpark",
    article: "usingballatpark1",
    target: 25,
  },
  {
    topic: "usingballatpark",
    article: "usingballatpark2",
    target: 25,
  },

  {
    topic: "casinoir",
    article: "casinoir1",
    target: 25,
  },
  {
    topic: "casinoir",
    article: "casinoir2",
    target: 25,
  },

  {
    topic: "decreasericeprice",
    article: "decreasericeprice1",
    target: 25,
  },
  {
    topic: "decreasericeprice",
    article: "decreasericeprice2",
    target: 25,
  },
].map((quota) => ({
  ...quota,
  completedCount: 0,
  incorrectCount: 0,
  expiredCount: 0,
}));

async function seedAssignmentQuotas() {
  try {
    await connectDatabase();

    /*
     * WARNING:
     * This deletes all existing quota documents
     * before creating the new experiment quotas.
     */
    await AssignmentQuota.deleteMany({});

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