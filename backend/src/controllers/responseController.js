import Response from "../models/Response.js";

const CORRECT_KEYWORD = "ワニ";

// Temporary code used during development.
// Later, replace this with separate correct/incorrect codes.
const TEMPORARY_COMPLETION_CODE = "MTC8264";

export async function createResponse(req, res, next) {
  try {
    const {
      sessionId,
      topic,
      condition,
      pattern,

      ageGroup,
      gender,

      preStance,
      preKnowledge,

      postUnderstanding,
      postNewInformation,
      postFurtherExploration,

      chatbotAppropriateness,
      chatbotTrustworthiness,
      chatbotEngagement,

      postStance,
      freeComment,

      keywordAnswer,
      startedAt,
    } = req.body;

    /*
     * Basic checks before attempting to save.
     * Mongoose will perform the detailed schema validation.
     */
    if (!sessionId) {
      return res.status(400).json({
        message: "sessionId is required.",
      });
    }

    if (!startedAt) {
      return res.status(400).json({
        message: "startedAt is required.",
      });
    }

    if (!keywordAnswer) {
      return res.status(400).json({
        message: "keywordAnswer is required.",
      });
    }

    const parsedStartedAt = new Date(startedAt);

    if (Number.isNaN(parsedStartedAt.getTime())) {
      return res.status(400).json({
        message: "startedAt is invalid.",
      });
    }

    const completedAt = new Date();

    const completionTimeSeconds = Math.max(
      0,
      Math.round(
        (completedAt.getTime() - parsedStartedAt.getTime()) /
          1000,
      ),
    );

    /*
     * A wrong answer is still valid input.
     * We save both the original answer and whether it was correct.
     */
    const keywordCorrect =
      keywordAnswer === CORRECT_KEYWORD;

    const savedResponse = await Response.create({
      sessionId,

      topic,
      condition,

      pattern:
        condition === "mytwocents"
          ? pattern
          : null,

      ageGroup,
      gender,

      preStance,
      preKnowledge,

      postUnderstanding,
      postNewInformation,
      postFurtherExploration,

      chatbotAppropriateness:
        condition === "mytwocents"
          ? chatbotAppropriateness
          : null,

      chatbotTrustworthiness:
        condition === "mytwocents"
          ? chatbotTrustworthiness
          : null,

      chatbotEngagement:
        condition === "mytwocents"
          ? chatbotEngagement
          : null,

      postStance,

      freeComment: freeComment ?? "",

      keywordAnswer,
      keywordCorrect,

      startedAt: parsedStartedAt,
      completedAt,
      completionTimeSeconds,
    });

    /*
     * Only return a code after MongoDB successfully saves
     * the participant's response.
     */
    return res.status(201).json({
      saved: true,
      responseId: savedResponse._id,
      completionCode: TEMPORARY_COMPLETION_CODE,
    });
  } catch (error) {
    /*
     * sessionId is unique, so submitting the same session
     * twice creates MongoDB duplicate-key error 11000.
     */
    if (error?.code === 11000) {
      return res.status(409).json({
        message:
          "This questionnaire session has already been submitted.",
      });
    }

    /*
     * Return readable Mongoose validation errors.
     */
    if (error?.name === "ValidationError") {
      const validationErrors = Object.values(
        error.errors,
      ).map((validationError) => validationError.message);

      return res.status(400).json({
        message: "Submitted response data is invalid.",
        errors: validationErrors,
      });
    }

    next(error);
  }
}