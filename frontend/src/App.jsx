import { useEffect, useState } from "react";

import ConsentPage from "./pages/ConsentPage/ConsentPage";
import PreSurveyPage from "./pages/PreSurveyPage/PreSurveyPage";
import ExperimentPage from "./pages/ExperimentPage/ExperimentPage";
import PostSurveyPage from "./pages/PostSurveyPage/PostSurveyPage";
import CompletionPage from "./pages/CompletionPage/CompletionPage";

// Local: frontend/.env -> http://localhost:5050
// Production: Vercel -> Render backend URL
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
   * Preserve the original questionnaire start time
   * even if the participant refreshes the page.
   */
  const [startedAt] = useState(() => {
    const savedStartedAt =
      localStorage.getItem("mtcStartedAt");

    if (savedStartedAt) {
      return savedStartedAt;
    }

    const newStartedAt =
      new Date().toISOString();

    localStorage.setItem(
      "mtcStartedAt",
      newStartedAt,
    );

    return newStartedAt;
  });

  /*
   * Restore the page the participant was on
   * before refreshing.
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

  const [assignment, setAssignment] =
    useState(null);

  const [
    assignmentError,
    setAssignmentError,
  ] = useState("");

  const [
    isLoadingAssignment,
    setIsLoadingAssignment,
  ] = useState(true);

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
   * If they already submitted and refresh,
   * preserve the completion code.
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
        Math.max(
          previousIndex - 1,
          0,
        ),
    );

    scrollToTop();
  }

  function updatePreSurveyAnswer(
    questionKey,
    value,
  ) {
    setResponses(
      (previousResponses) => ({
        ...previousResponses,

        preSurvey: {
          ...previousResponses.preSurvey,
          [questionKey]: value,
        },
      }),
    );
  }

  function updatePostSurveyAnswer(
    questionKey,
    value,
  ) {
    setResponses(
      (previousResponses) => ({
        ...previousResponses,

        postSurvey: {
          ...previousResponses.postSurvey,
          [questionKey]: value,
        },
      }),
    );
  }

  function updateCompletionKeyword(
    value,
  ) {
    setResponses(
      (previousResponses) => ({
        ...previousResponses,

        completionCheck: {
          ...previousResponses.completionCheck,
          keyword: value,
        },
      }),
    );
  }

  /*
   * Get an experimental assignment.
   *
   * If one already exists in localStorage,
   * reuse it instead of reserving another quota.
   */
  useEffect(() => {
    async function startSession() {
      try {
        setIsLoadingAssignment(true);
        setAssignmentError("");

        const savedAssignment =
          localStorage.getItem(
            "mtcAssignment",
          );

        if (savedAssignment) {
          try {
            setAssignment(
              JSON.parse(savedAssignment),
            );

            return;
          } catch {
            localStorage.removeItem(
              "mtcAssignment",
            );
          }
        }

        const response = await fetch(
          `${API_URL}/api/sessions/start`,
          {
            method: "POST",
          },
        );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "実験条件の割り当てに失敗しました。",
          );
        }

        setAssignment(result);

        localStorage.setItem(
          "mtcAssignment",
          JSON.stringify(result),
        );

        console.log(
          "Assigned condition:",
          result,
        );
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

    startSession();
  }, []);

  /*
   * Save questionnaire answers whenever
   * they change.
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
   * Preserve completion code after submission.
   */
  useEffect(() => {
    if (completionCode) {
      localStorage.setItem(
        "mtcCompletionCode",
        completionCode,
      );
    }
  }, [completionCode]);

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
        responses.preSurvey
          .topicKnowledge,

      postUnderstanding:
        responses.postSurvey
          .understanding,

      postNewInformation:
        responses.postSurvey
          .newInformation,

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
        responses.completionCheck
          .keyword,

      startedAt,
    };

  try {
    const response = await fetch(
      `${API_URL}/api/responses`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(submissionData),
      },
    );

    // Read the raw response first so an empty
    // backend response doesn't crash response.json().
    const responseText = await response.text();

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
      result = JSON.parse(responseText);
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
   * Do not render the questionnaire until
   * an assignment has been loaded.
   */
  if (isLoadingAssignment) {
    return (
      <p>
        実験を準備しています...
      </p>
    );
  }

  if (assignmentError) {
    return (
      <p>
        {assignmentError}
      </p>
    );
  }

  if (!assignment) {
    return (
      <p>
        実験条件を読み込めませんでした。
      </p>
    );
  }

  return (
    <>
      {currentPage === "consent" && (
        <ConsentPage
          onNext={goNext}
        />
      )}

      {currentPage === "preSurvey" && (
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

      {currentPage === "experiment" && (
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

      {currentPage === "postSurvey" && (
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

      {currentPage === "completion" && (
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