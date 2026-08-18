import { useEffect, useState } from "react";

import ConsentPage from "./pages/ConsentPage/ConsentPage";
import PreSurveyPage from "./pages/PreSurveyPage/PreSurveyPage";
import ExperimentPage from "./pages/ExperimentPage/ExperimentPage";
import PostSurveyPage from "./pages/PostSurveyPage/PostSurveyPage";
import CompletionPage from "./pages/CompletionPage/CompletionPage";

const API_URL = import.meta.env.VITE_API_URL;

const PAGE_ORDER = [
  "consent",
  "preSurvey",
  "experiment",
  "postSurvey",
  "completion",
];

const initialResponses = {
  preSurvey: {
    ageGroup: null,
    gender: null,
    preStance: null,
    topicKnowledge: null,
  },

  postSurvey: {
    understanding: null,
    newInformation: null,
    furtherExploration: null,
    chatbotAppropriateness: null,
    chatbotTrustworthiness: null,
    chatbotEngagement: null,
    postStance: null,
    freeComment: "",
  },

  completionCheck: {
    keyword: null,
  },
};

export default function App() {
  /*
   * Restore an existing assignment after refresh.
   *
   * IMPORTANT:
   * We do NOT create a new assignment here anymore.
   */
  const [assignment, setAssignment] = useState(() => {
    const savedAssignment =
      localStorage.getItem("mtcAssignment");

    if (!savedAssignment) {
      return null;
    }

    try {
      return JSON.parse(savedAssignment);
    } catch {
      localStorage.removeItem("mtcAssignment");
      return null;
    }
  });

  /*
   * Preserve questionnaire start time.
   */
  const [startedAt, setStartedAt] = useState(() => {
    return (
      localStorage.getItem("mtcStartedAt") || ""
    );
  });

  /*
   * Restore current page after refresh.
   */
  const [
    currentPageIndex,
    setCurrentPageIndex,
  ] = useState(() => {
    const savedPage =
      localStorage.getItem("mtcCurrentPage");

    if (savedPage === null) {
      return 0;
    }

    const parsedPage = Number(savedPage);

    if (
      Number.isNaN(parsedPage) ||
      parsedPage < 0 ||
      parsedPage >= PAGE_ORDER.length
    ) {
      return 0;
    }

    return parsedPage;
  });

  const [
    assignmentError,
    setAssignmentError,
  ] = useState("");

  const [
    isLoadingAssignment,
    setIsLoadingAssignment,
  ] = useState(false);

  /*
   * Restore questionnaire answers after refresh.
   */
  const [responses, setResponses] =
    useState(() => {
      const savedResponses =
        localStorage.getItem("mtcResponses");

      if (!savedResponses) {
        return initialResponses;
      }

      try {
        return JSON.parse(savedResponses);
      } catch {
        return initialResponses;
      }
    });

  /*
   * Preserve completion code after refresh.
   */
  const [
    completionCode,
    setCompletionCode,
  ] = useState(
    () =>
      localStorage.getItem(
        "mtcCompletionCode",
      ) || "",
  );

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [submitError, setSubmitError] =
    useState("");

  const currentPage =
    PAGE_ORDER[currentPageIndex];

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function goNext() {
    setCurrentPageIndex(
      (previousIndex) =>
        Math.min(
          previousIndex + 1,
          PAGE_ORDER.length - 1,
        ),
    );

    scrollToTop();
  }

  function goPrevious() {
    setCurrentPageIndex(
      (previousIndex) =>
        Math.max(previousIndex - 1, 0),
    );

    scrollToTop();
  }

  function updatePreSurveyAnswer(
    questionKey,
    value,
  ) {
    setResponses((previousResponses) => ({
      ...previousResponses,

      preSurvey: {
        ...previousResponses.preSurvey,
        [questionKey]: value,
      },
    }));
  }

  function updatePostSurveyAnswer(
    questionKey,
    value,
  ) {
    setResponses((previousResponses) => ({
      ...previousResponses,

      postSurvey: {
        ...previousResponses.postSurvey,
        [questionKey]: value,
      },
    }));
  }

  function updateCompletionKeyword(value) {
    setResponses((previousResponses) => ({
      ...previousResponses,

      completionCheck: {
        ...previousResponses.completionCheck,
        keyword: value,
      },
    }));
  }

  /*
   * Called ONLY after the participant clicks
   * "同意して次へ".
   *
   * This is now the moment when the participant
   * receives an experimental assignment.
   */
  async function handleConsentNext() {
    if (isLoadingAssignment) {
      return;
    }

    /*
     * If an assignment already exists, such as
     * after returning to the consent page,
     * do not reserve another slot.
     */
    if (assignment) {
      goNext();
      return;
    }

    try {
      setIsLoadingAssignment(true);
      setAssignmentError("");

      const response = await fetch(
        `${API_URL}/api/sessions/start`,
        {
          method: "POST",
        },
      );

      const responseText =
        await response.text();

      let result = {};

      if (responseText) {
        result = JSON.parse(responseText);
      }

      /*
       * No experimental slots remain.
       */
      if (response.status === 409) {
        setAssignmentError(
          "募集人数に達したため、現在このアンケートには参加できません。",
        );

        return;
      }

      if (!response.ok) {
        throw new Error(
          result.message ||
            "実験条件の割り当てに失敗しました。",
        );
      }

      /*
       * Save the assignment.
       */
      setAssignment(result);

      localStorage.setItem(
        "mtcAssignment",
        JSON.stringify(result),
      );

      /*
       * Questionnaire timing starts when the
       * participant is actually assigned.
       */
      const newStartedAt =
        new Date().toISOString();

      setStartedAt(newStartedAt);

      localStorage.setItem(
        "mtcStartedAt",
        newStartedAt,
      );

      console.log(
        "Assigned condition:",
        result,
      );

      /*
       * Assignment succeeded.
       * Move to PreSurvey.
       */
      goNext();
    } catch (error) {
      console.error(
        "Assignment failed:",
        error,
      );

      setAssignmentError(
        error.message ||
          "実験条件の割り当てに失敗しました。",
      );
    } finally {
      setIsLoadingAssignment(false);
    }
  }

  /*
   * Save responses whenever they change.
   */
  useEffect(() => {
    localStorage.setItem(
      "mtcResponses",
      JSON.stringify(responses),
    );
  }, [responses]);

  /*
   * Save current questionnaire page.
   */
  useEffect(() => {
    localStorage.setItem(
      "mtcCurrentPage",
      String(currentPageIndex),
    );
  }, [currentPageIndex]);

  /*
   * Preserve completion code.
   */
  useEffect(() => {
    if (completionCode) {
      localStorage.setItem(
        "mtcCompletionCode",
        completionCode,
      );
    }
  }, [completionCode]);

  /*
   * Safety:
   *
   * If there is no assignment but localStorage
   * says the participant was on a later page,
   * return them to Consent.
   */
  useEffect(() => {
    if (
      !assignment &&
      currentPageIndex > 0
    ) {
      setCurrentPageIndex(0);
    }
  }, [assignment, currentPageIndex]);

  async function submitStudy() {
    if (
      isSubmitting ||
      completionCode ||
      !assignment
    ) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    const submissionData = {
      sessionId: assignment.sessionId,

      topic: assignment.topic,

      condition: assignment.condition,

      pattern: assignment.pattern,

      ageGroup:
        responses.preSurvey.ageGroup,

      gender:
        responses.preSurvey.gender,

      preStance:
        responses.preSurvey.preStance,

      preKnowledge:
        responses.preSurvey.topicKnowledge,

      postUnderstanding:
        responses.postSurvey.understanding,

      postNewInformation:
        responses.postSurvey.newInformation,

      postFurtherExploration:
        responses.postSurvey
          .furtherExploration,

      chatbotAppropriateness:
        responses.postSurvey
          .chatbotAppropriateness,

      chatbotTrustworthiness:
        responses.postSurvey
          .chatbotTrustworthiness,

      chatbotEngagement:
        responses.postSurvey
          .chatbotEngagement,

      postStance:
        responses.postSurvey.postStance,

      freeComment:
        responses.postSurvey.freeComment,

      keywordAnswer:
        responses.completionCheck.keyword,

      startedAt,
    };

    try {
      const response = await fetch(
        `${API_URL}/api/responses`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            submissionData,
          ),
        },
      );

      const responseText =
        await response.text();

      console.log(
        "Response status:",
        response.status,
      );

      console.log(
        "Raw backend response:",
        responseText,
      );

      let result = {};

      if (responseText) {
        result =
          JSON.parse(responseText);
      }

      console.log(
        "Backend response:",
        result,
      );

      if (!response.ok) {
        throw new Error(
          result.errors?.join(", ") ||
            result.message ||
            `回答の保存に失敗しました。 (${response.status})`,
        );
      }

      if (!result.completionCode) {
        throw new Error(
          "回答は送信されましたが、完了コードを取得できませんでした。",
        );
      }

      setCompletionCode(
        result.completionCode,
      );
    } catch (error) {
      console.error(
        "Submission failed:",
        error,
      );

      setSubmitError(
        error.message ||
          "回答の保存に失敗しました。もう一度お試しください。",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {currentPage === "consent" && (
        <ConsentPage
          onNext={handleConsentNext}
          isLoading={isLoadingAssignment}
          assignmentError={assignmentError}
        />
      )}

      {currentPage === "preSurvey" &&
        assignment && (
          <PreSurveyPage
            topic={
              assignment.topicLabel
            }
            answers={
              responses.preSurvey
            }
            onAnswerChange={
              updatePreSurveyAnswer
            }
            onPrevious={
              goPrevious
            }
            onNext={
              goNext
            }
          />
        )}

      {currentPage === "experiment" &&
        assignment && (
          <ExperimentPage
            assignment={
              assignment
            }
            onPrevious={
              goPrevious
            }
            onNext={
              goNext
            }
          />
        )}

      {currentPage === "postSurvey" &&
        assignment && (
          <PostSurveyPage
            topic={
              assignment.topicLabel
            }
            condition={
              assignment.condition
            }
            answers={
              responses.postSurvey
            }
            onAnswerChange={
              updatePostSurveyAnswer
            }
            onPrevious={
              goPrevious
            }
            onSubmit={
              goNext
            }
          />
        )}

      {currentPage === "completion" &&
        assignment && (
          <CompletionPage
            selectedKeyword={
              responses
                .completionCheck
                .keyword
            }
            onKeywordChange={
              updateCompletionKeyword
            }
            onSubmit={
              submitStudy
            }
            onPrevious={
              goPrevious
            }
            completionCode={
              completionCode
            }
            isSubmitting={
              isSubmitting
            }
            submitError={
              submitError
            }
          />
        )}
    </>
  );
}