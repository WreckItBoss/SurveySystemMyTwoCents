import { useEffect, useState } from "react";

import ConsentPage from "./pages/ConsentPage/ConsentPage";
import PreSurveyPage from "./pages/PreSurveyPage/PreSurveyPage";
import ExperimentPage from "./pages/ExperimentPage/ExperimentPage";
import PostSurveyPage from "./pages/PostSurveyPage/PostSurveyPage";
import CompletionPage from "./pages/CompletionPage/CompletionPage";
import SessionClosedPage from "./pages/SessionClosedPage/SessionClosedPage";

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
    systemComment: "",
    freeComment: "",
  },

  completionCheck: {
    keyword: null,
  },
};

export default function App() {
  /*
   * sessionClosed is intentionally NOT stored
   * in localStorage.
   *
   * Timeout:
   * -> show SessionClosedPage for this visit
   *
   * Refresh / reopen:
   * -> sessionClosed becomes false again
   * -> localStorage is empty
   * -> ConsentPage is shown
   */
  const [sessionClosed, setSessionClosed] =
    useState(false);

  /*
   * Restore existing assignment after refresh.
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
   * Assignment happens ONLY after
   * "同意して次へ" is clicked.
   */
  async function handleConsentNext() {
    if (isLoadingAssignment) {
      return;
    }

    /*
     * Existing active assignment:
     * reuse it instead of reserving again.
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
       * Save assignment.
       */
      setAssignment(result);

      localStorage.setItem(
        "mtcAssignment",
        JSON.stringify(result),
      );

      /*
       * Timing begins when assignment happens.
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
   * Save responses while the current
   * questionnaire session is active.
   */
  useEffect(() => {
    if (sessionClosed) {
      return;
    }

    localStorage.setItem(
      "mtcResponses",
      JSON.stringify(responses),
    );
  }, [responses, sessionClosed]);

  /*
   * Save current page while the current
   * questionnaire session is active.
   */
  useEffect(() => {
    if (sessionClosed) {
      return;
    }

    localStorage.setItem(
      "mtcCurrentPage",
      String(currentPageIndex),
    );
  }, [currentPageIndex, sessionClosed]);

  /*
   * Preserve completion code.
   */
  useEffect(() => {
    if (
      completionCode &&
      !sessionClosed
    ) {
      localStorage.setItem(
        "mtcCompletionCode",
        completionCode,
      );
    }
  }, [completionCode, sessionClosed]);

  /*
   * If there is no assignment but the browser
   * thinks it was on a later questionnaire page,
   * return to Consent.
   */
  useEffect(() => {
    if (
      !sessionClosed &&
      !assignment &&
      currentPageIndex > 0
    ) {
      setCurrentPageIndex(0);
    }
  }, [
    assignment,
    currentPageIndex,
    sessionClosed,
  ]);

  /*
   * SESSION TIMEOUT
   *
   * When expiresAt is reached:
   *
   * 1. Tell backend to expire the session.
   * 2. Backend releases reservedCount.
   * 3. Clear questionnaire localStorage.
   * 4. Show SessionClosedPage for THIS visit.
   *
   * sessionClosed is not persisted.
   * Therefore refreshing/reopening the questionnaire
   * starts again from Consent.
   */
  useEffect(() => {
    if (
      !assignment?.expiresAt ||
      completionCode
    ) {
      return;
    }

    const expiresAtTime =
      new Date(
        assignment.expiresAt,
      ).getTime();

    if (Number.isNaN(expiresAtTime)) {
      console.error(
        "Invalid session expiration time:",
        assignment.expiresAt,
      );

      return;
    }

    async function handleSessionTimeout() {
      /*
       * Save sessionId before removing assignment.
       */
      const expiredSessionId =
        assignment.sessionId;

      /*
       * Immediately tell backend to release
       * this reservation.
       */
      try {
        const response = await fetch(
          `${API_URL}/api/sessions/${expiredSessionId}/expire`,
          {
            method: "POST",
          },
        );

        if (!response.ok) {
          console.error(
            "Failed to expire session:",
            response.status,
          );
        } else {
          const result =
            await response.json();

          console.log(
            "Session expiration result:",
            result,
          );
        }
      } catch (error) {
        /*
         * The backend cleanup in assignmentService
         * remains the fallback if this request fails.
         */
        console.error(
          "Failed to notify backend of timeout:",
          error,
        );
      }

      /*
       * Clear React questionnaire state.
       */
      setAssignment(null);
      setResponses(initialResponses);
      setStartedAt("");
      setCompletionCode("");
      setSubmitError("");
      setAssignmentError("");
      setCurrentPageIndex(0);

      /*
       * Clear ALL questionnaire localStorage.
       *
       * Because sessionClosed itself is not saved,
       * reopening or refreshing starts at Consent.
       */
      localStorage.removeItem(
        "mtcAssignment",
      );

      localStorage.removeItem(
        "mtcResponses",
      );

      localStorage.removeItem(
        "mtcCurrentPage",
      );

      localStorage.removeItem(
        "mtcStartedAt",
      );

      localStorage.removeItem(
        "mtcCompletionCode",
      );

      /*
       * Close only this current browser visit.
       */
      setSessionClosed(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }

    const remainingTime =
      expiresAtTime - Date.now();

    /*
     * Handles reopening a still-saved session
     * after its expiration time has already passed.
     */
    if (remainingTime <= 0) {
      handleSessionTimeout();
      return;
    }

    const timeoutId =
      window.setTimeout(
        handleSessionTimeout,
        remainingTime,
      );

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [assignment, completionCode]);

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
      sessionId:
        assignment.sessionId,

      topic:
        assignment.topic,

      condition:
        assignment.condition,

      pattern:
        assignment.pattern,

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

      systemComment:
        responses.postSurvey.systemComment,

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

  /*
   * Timeout closes only this current visit.
   */
  if (sessionClosed) {
    return <SessionClosedPage />;
  }

  return (
    <>
      {currentPage === "consent" && (
        <ConsentPage
          onNext={handleConsentNext}
          isLoading={
            isLoadingAssignment
          }
          assignmentError={
            assignmentError
          }
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