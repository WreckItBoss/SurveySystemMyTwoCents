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

      ageGroup,
      gender,

      preStance,
      preKnowledge,

      postUnderstanding,
      postNewInformation,
      postPerspectiveComparison,
      postFurtherExploration,
      postFurtherExplorationReason,

      chatbotAppropriateness,
      chatbotTrustworthiness,
      chatbotEngagement,

      postStance,
      systemComment,
      freeComment,

      keywordAnswer,
      startedAt,
    } = req.body;

    /*
     * ==================================================
     * BASIC VALIDATION
     * ==================================================
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

    const parsedStartedAt = new Date(
      startedAt,
    );

    if (
      Number.isNaN(
        parsedStartedAt.getTime(),
      )
    ) {
      return res.status(400).json({
        message: "startedAt is invalid.",
      });
    }

    /*
     * ==================================================
     * GET ASSIGNMENT FROM SESSION
     * ==================================================
     *
     * Do NOT trust topic/article/condition/pattern
     * information sent by the frontend.
     *
     * Session is the source of truth.
     */

    const activeSession =
      await Session.findOne({
        sessionId,
        status: "active",
      });

    if (!activeSession) {
      return res.status(409).json({
        message:
          "This questionnaire session is no longer active.",
      });
    }

    if (!activeSession.article) {
      return res.status(500).json({
        message:
          "The questionnaire session does not have an assigned article.",
      });
    }

    if (!activeSession.pattern) {
      return res.status(500).json({
        message:
          "The questionnaire session does not have an assigned pattern.",
      });
    }

    const topic =
      activeSession.topic;

    const article =
      activeSession.article;

    const condition =
      activeSession.condition;

    const pattern =
      activeSession.pattern;

    /*
     * ==================================================
     * COMPLETION INFORMATION
     * ==================================================
     */

    const completedAt = new Date();

    const completionTimeSeconds =
      Math.max(
        0,
        Math.round(
          (
            completedAt.getTime() -
            parsedStartedAt.getTime()
          ) / 1000,
        ),
      );

    const keywordCorrect =
      keywordAnswer ===
      CORRECT_KEYWORD;

    const completionCode =
      keywordCorrect
        ? CORRECT_COMPLETION_CODE
        : INCORRECT_COMPLETION_CODE;

    /*
     * ==================================================
     * SAVE RESPONSE
     * ==================================================
     */

    const savedResponse =
      await Response.create({
        sessionId,

        topic,
        article,
        condition,
        pattern,

        ageGroup,
        gender,

        preStance,
        preKnowledge,

        postUnderstanding,
        postNewInformation,
        postPerspectiveComparison,
        postFurtherExploration,

        postFurtherExplorationReason:
          postFurtherExplorationReason ??
          "",

        /*
         * MyTwoCents-specific questions.
         */
        chatbotAppropriateness,
        chatbotTrustworthiness,
        chatbotEngagement,

        postStance,

        systemComment:
          systemComment ?? "",

        freeComment:
          freeComment ?? "",

        keywordAnswer,
        keywordCorrect,

        startedAt:
          parsedStartedAt,

        completedAt,
        completionTimeSeconds,
      });

    /*
     * ==================================================
     * COMPLETE SESSION
     * ==================================================
     */

    const completedSession =
      await Session.findOneAndUpdate(
        {
          _id: activeSession._id,
          status: "active",
        },
        {
          $set: {
            status:
              keywordCorrect
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
     * The session could have expired between
     * the initial lookup and this update.
     */
    if (!completedSession) {
      await Response.deleteOne({
        _id: savedResponse._id,
      });

      return res.status(409).json({
        message:
          "This questionnaire session is no longer active.",
      });
    }

    /*
     * ==================================================
     * UPDATE ARTICLE + PATTERN QUOTA
     * ==================================================
     *
     * Each article + pattern combination
     * is one experimental cell.
     *
     * Correct:
     *   completedCount +1
     *
     * Incorrect:
     *   incorrectCount +1
     */

    if (keywordCorrect) {
      await AssignmentQuota.findOneAndUpdate(
        {
          article:
            completedSession.article,

          pattern:
            completedSession.pattern,
        },
        {
          $inc: {
            completedCount: 1,
          },
        },
      );
    } else {
      await AssignmentQuota.findOneAndUpdate(
        {
          article:
            completedSession.article,

          pattern:
            completedSession.pattern,
        },
        {
          $inc: {
            incorrectCount: 1,
          },
        },
      );
    }

    /*
     * ==================================================
     * RETURN COMPLETION CODE
     * ==================================================
     */

    return res.status(201).json({
      saved: true,
      responseId:
        savedResponse._id,
      completionCode,
    });
  } catch (error) {
    /*
     * Duplicate session submission.
     */
    if (error?.code === 11000) {
      return res.status(409).json({
        message:
          "This questionnaire session has already been submitted.",
      });
    }

    /*
     * Mongoose validation error.
     */
    if (
      error?.name ===
      "ValidationError"
    ) {
      const validationErrors =
        Object.values(
          error.errors,
        ).map(
          (validationError) =>
            validationError.message,
        );

      return res.status(400).json({
        message:
          "Submitted response data is invalid.",
        errors:
          validationErrors,
      });
    }

    next(error);
  }
}