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
        "usingballatpark",
        "immigration",
        "casinoir",
        "decreasericeprice",
      ],
    },

    /*
     * This temporary experiment is News Only.
     *
     * We keep condition in the Session model
     * because the existing frontend/backend
     * already uses it.
     */
    condition: {
      type: String,
      required: true,
      enum: ["news"],
      default: "news",
    },

    /*
     * Exact article shown to the participant.
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
     * Kept temporarily for compatibility with
     * the existing application.
     *
     * Since there is no MyTwoCents condition
     * in this experiment, this will always
     * remain null.
     */
    pattern: {
      type: String,
      default: null,
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
  {
    timestamps: true,
  },
);

const Session = mongoose.model(
  "Session",
  sessionSchema,
);

export default Session;