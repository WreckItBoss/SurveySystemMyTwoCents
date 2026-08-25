import mongoose from "mongoose";

const assignmentQuotaSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      required: true,
      enum: [
        "nuclearenergy",
        "immigration",
        "usingballatpark",
        "casinoir",
        "decreasericeprice",
      ],
    },

    /*
     * Specific news article assigned within the topic.
     *
     * Each topic has two articles:
     *   nuclearenergy1
     *   nuclearenergy2
     *   usingballatpark1
     *   usingballatpark2
     *   ...
     */
    article: {
      type: String,
      required: true,
      enum: [
        "nuclearenergy1",
        "nuclearenergy2",
        "usingballatpark1",
        "usingballatpark2",
        "immigration1",
        "immigration2",
        "casinoir1",
        "casinoir2",
        "decreasericeprice1",
        "decreasericeprice2",
      ],
    },

    /*
     * Number of valid completed participants
     * required for this article.
     *
     * For this experiment this will be 25
     * for every article.
     */
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

/*
 * Each article has exactly one quota document.
 */
assignmentQuotaSchema.index(
  {
    article: 1,
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