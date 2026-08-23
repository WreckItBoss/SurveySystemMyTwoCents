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
      default: null,
      min: 1,
      max: 5,
    },

    chatbotTrustworthiness: {
      type: Number,
      default: null,
      min: 1,
      max: 5,
    },

    chatbotEngagement: {
      type: Number,
      default: null,
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
    },

    freeComment: {
      type: String,
      default: "",
      trim: true,
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