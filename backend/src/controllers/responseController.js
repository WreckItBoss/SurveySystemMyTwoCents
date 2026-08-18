import Response from "../Models/Response.js";
import AssignmentQuota from "../Models/AssignmentQuota.js";
import Session from "../Models/Session.js";
import "dotenv/config";

const CORRECT_KEYWORD = "ワニ";

const CORRECT_COMPLETION_CODE =
  process.env.CORRECT_COMPLETION_CODE;

const INCORRECT_COMPLETION_CODE =
  process.env.INCORRECT_COMPLETION_CODE;

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
        (completedAt.getTime() -
          parsedStartedAt.getTime()) /
          1000,
      ),
    );

    const keywordCorrect =
      keywordAnswer === CORRECT_KEYWORD;

    const completionCode = keywordCorrect
      ? CORRECT_COMPLETION_CODE
      : INCORRECT_COMPLETION_CODE;

    const normalizedPattern =
      condition === "mytwocents"
        ? pattern
        : null;

    const savedResponse = await Response.create({
      sessionId,

      topic,
      condition,
      pattern: normalizedPattern,

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
     * Only an active session can transition
     * into a completed state.
     */
    const completedSession =
      await Session.findOneAndUpdate(
        {
          sessionId,
          status: "active",
        },
        {
          $set: {
            status: keywordCorrect
              ? "completed_correct"
              : "completed_incorrect",

            completedAt,
          },
        },
        {
          new: true,
        },
      );

    /*
     * Update quota statistics only if this
     * session successfully transitioned from
     * active to a completed state.
     */
    if (completedSession) {
      if (keywordCorrect) {
        /*
         * Correct submission:
         * count as a valid completed participant.
         */
        await AssignmentQuota.findOneAndUpdate(
          {
            topic,
            condition,
            pattern: normalizedPattern,
          },
          {
            $inc: {
              completedCount: 1,
            },
          },
        );
      } else {
        /*
         * Incorrect submission:
         * record it separately and release
         * the reserved quota slot.
         */
        await AssignmentQuota.findOneAndUpdate(
          {
            topic,
            condition,
            pattern: normalizedPattern,

            reservedCount: {
              $gt: 0,
            },
          },
          {
            $inc: {
              incorrectCount: 1,
              reservedCount: -1,
            },
          },
        );
      }
    }

    return res.status(201).json({
      saved: true,
      responseId: savedResponse._id,
      completionCode,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        message:
          "This questionnaire session has already been submitted.",
      });
    }

    if (error?.name === "ValidationError") {
      const validationErrors = Object.values(
        error.errors,
      ).map(
        (validationError) =>
          validationError.message,
      );

      return res.status(400).json({
        message:
          "Submitted response data is invalid.",
        errors: validationErrors,
      });
    }

    next(error);
  }
}