import mongoose from "mongoose";

const assignmentQuotaSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      required: true,
      enum: [
        "aiCopyright",
        "aiinschool",
        "immigration",
        "underagesns",
      ],
    },

    article: {
      type: String,
      required: true,
      enum: [
        "aiCopyright",
        "aiinschool",
        "immigration",
        "underagesns",
      ],
    },

    condition: {
      type: String,
      required: true,
      enum: ["mytwocents"],
      default: "mytwocents",
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

    target: {
      type: Number,
      required: true,
      min: 1,
    },

    completedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    incorrectCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    expiredCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);

assignmentQuotaSchema.index(
  {
    article: 1,
    pattern: 1,
  },
  { unique: true },
);

const AssignmentQuota = mongoose.model(
  "AssignmentQuota",
  assignmentQuotaSchema,
);

export default AssignmentQuota;