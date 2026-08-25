import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";

import connectDatabase from "../config/database.js";
import Response from "../Models/Response.js";

function escapeCsvValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  const text = String(value);

  if (
    text.includes(",") ||
    text.includes('"') ||
    text.includes("\n")
  ) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

async function exportResponsesToCsv() {
  try {
    await connectDatabase();

    const responses = await Response.find({})
      .sort({ createdAt: 1 })
      .lean();

    if (responses.length === 0) {
      console.log("No responses found.");
      return;
    }

    /*
     * Define the CSV column order explicitly.
     */
    const columns = [
      "sessionId",
      "topic",
      "condition",
      "pattern",

      "ageGroup",
      "gender",

      "preStance",
      "preKnowledge",

      "postUnderstanding",
      "postNewInformation",
      "postPerspectiveComparison",
      "postFurtherExploration",
      "postFurtherExplorationReason",

      "chatbotAppropriateness",
      "chatbotTrustworthiness",
      "chatbotEngagement",

      "postStance",

      "systemComment",
      "freeComment",

      "keywordAnswer",
      "keywordCorrect",

      "startedAt",
      "completedAt",
      "completionTimeSeconds",

      "createdAt",
      "updatedAt",
    ];

    const rows = [];

    rows.push(columns.join(","));

    for (const response of responses) {
      const row = columns.map((column) => {
        const value = response[column];

        if (value instanceof Date) {
          return escapeCsvValue(
            value.toISOString(),
          );
        }

        return escapeCsvValue(value);
      });

      rows.push(row.join(","));
    }

    const outputDirectory = path.resolve(
      "exports",
    );

    fs.mkdirSync(
      outputDirectory,
      {
        recursive: true,
      },
    );

    const outputPath = path.join(
      outputDirectory,
      "responses.csv",
    );

    fs.writeFileSync(
      outputPath,
      rows.join("\n"),
      "utf8",
    );

    console.log(
      `Exported ${responses.length} responses to ${outputPath}`,
    );
  } catch (error) {
    console.error(
      "Failed to export responses:",
      error,
    );
  } finally {
    await mongoose.disconnect();
  }
}

exportResponsesToCsv();