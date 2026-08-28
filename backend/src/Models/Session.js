import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },

    topic: {
      type: String,
      required: true,
      enum: [
        "nuclearenergy",
        "casinoir",
      ],
    },

    condition: {
      type: String,
      required: true,
      enum: ["mytwocents"],
      default: "mytwocents",
    },

    article: {
      type: String,
      required: true,
      enum: [
        "nuclearenergy1",
        "casinoir2",
      ],
    },

    pattern: {
      type: String,
      required: true,
      enum: [
        "P01",
        "P02",
        "P03",
        "P04",
        "P05",
      ],
    },

    status: {
      type: String,
      required: true,
      enum: [
        "active",
        "completed_correct",
        "completed_incorrect",
        "expired",
      ],
      default: "active",
    },

    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

const Session = mongoose.model(
  "Session",
  sessionSchema,
);

export default Session;