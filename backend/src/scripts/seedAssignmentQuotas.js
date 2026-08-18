import "dotenv/config";
import mongoose from "mongoose";

import connectDatabase from "../config/database.js";
import AssignmentQuota from "../Models/AssignmentQuota.js";

const topics = [
  "nuclearenergy",
  "selfdrivingcars",
  "surveillance",
];

const quotas = [];

for (const topic of topics) {
  quotas.push({
    topic,
    condition: "news",
    pattern: null,
    target: 25,
    reservedCount: 0,
  });

  for (let patternNumber = 1; patternNumber <= 5; patternNumber += 1) {
    quotas.push({
      topic,
      condition: "mytwocents",
      pattern: `P0${patternNumber}`,
      target: 5,
      reservedCount: 0,
    });
  }
}

async function seedAssignmentQuotas() {
  try {
    await connectDatabase();

    await AssignmentQuota.deleteMany({});

    await AssignmentQuota.insertMany(quotas);

    console.log(
      `Inserted ${quotas.length} assignment quota documents.`,
    );
  } catch (error) {
    console.error("Failed to seed assignment quotas:");
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
}

seedAssignmentQuotas();