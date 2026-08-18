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

    // Number of participants who were assigned
    // to this experimental condition.
    reservedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Number of participants who actually
    // completed and submitted the questionnaire.
    // This is for monitoring only.
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