import mongoose from "mongoose";

const assignmentQuotaSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      required: true,
      enum: [
        "nuclearenergy",
        "selfdrivingcars",
        "surveillance",
      ],
    },

    condition: {
      type: String,
      required: true,
      enum: [
        "news",
        "mytwocents",
      ],
    },

    pattern: {
      type: String,
      default: null,
    },

    target: {
      type: Number,
      required: true,
      min: 1,
    },

    // Number of valid participants who
    // completed the questionnaire and
    // passed the attention check.
    completedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Number of participants who submitted
    // but failed the attention check.
    incorrectCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Number of participants whose session
    // expired before completing.
    expiredCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

assignmentQuotaSchema.index(
  {
    topic: 1,
    condition: 1,
    pattern: 1,
  },
  {
    unique: true,
  },
);

const AssignmentQuota = mongoose.model(
  "AssignmentQuota",
  assignmentQuotaSchema,
);

export default AssignmentQuota;