import mongoose from "mongoose";

const responseSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    topic: {
      type: String,
      required: true,
      enum: [
        "nuclearenergy",
        "casinoir",
      ],
    },

    /*
     * Exact news article shown to the participant.
     */
    article: {
      type: String,
      required: true,
      enum: [
        "nuclearenergy1",
        "casinoir2",
      ],
    },

    condition: {
      type: String,
      required: true,
      enum: ["mytwocents"],
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

    ageGroup: {
      type: String,
      required: true,
    },

    gender: {
      type: String,
      required: true,
    },

    preStance: {
      type: Number,
      required: true,
      min: 1,
      max: 4,
    },

    preKnowledge: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    postUnderstanding: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    postNewInformation: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    postPerspectiveComparison: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    postFurtherExploration: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    postFurtherExplorationReason: {
      type: String,
      default: "",
      maxlength: 1000,
    },

    chatbotAppropriateness: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    chatbotTrustworthiness: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    chatbotEngagement: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    postStance: {
      type: Number,
      required: true,
      min: 1,
      max: 4,
    },

    systemComment: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    freeComment: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    keywordAnswer: {
      type: String,
      required: true,
    },

    keywordCorrect: {
      type: Boolean,
      required: true,
    },

    startedAt: {
      type: Date,
      required: true,
    },

    completedAt: {
      type: Date,
      required: true,
    },

    completionTimeSeconds: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

const Response = mongoose.model(
  "Response",
  responseSchema,
);

export default Response;