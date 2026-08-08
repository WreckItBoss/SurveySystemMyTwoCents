import { useState } from "react";

import ConsentPage from "./pages/ConsentPage/ConsentPage";
import PreSurveyPage from "./pages/PreSurveyPage/PreSurveyPage";
import ExperimentPage from "./pages/ExperimentPage/ExperimentPage";
import PostSurveyPage from "./pages/PostSurveyPage/PostSurveyPage";
import CompletionPage from "./pages/CompletionPage/CompletionPage";
import { useEffect, useState } from "react";

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
  const [startedAt] = useState(
    () => new Date().toISOString(),
  );
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Temporary hardcoded assignment.
  // This will later come from the backend.
  // const [assignment] = useState({
  //   sessionId: "TEMP-SESSION-001",
  //   topic: "nuclearenergy",
  //   topicLabel: "原子力発電",
  //   condition: "news",
  //   // pattern: "P01",
  // });

  const [assignment, setAssignment] = useState(null);
  const [assignmentError, setAssignmentError] = useState("");
  const [isLoadingAssignment, setIsLoadingAssignment] = useState(true);

  const [responses, setResponses] = useState(initialResponses);

  const [completionCode, setCompletionCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const currentPage = PAGE_ORDER[currentPageIndex];

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function goNext() {
    setCurrentPageIndex((previousIndex) =>
      Math.min(previousIndex + 1, PAGE_ORDER.length - 1),
    );

    scrollToTop();
  }

  function goPrevious() {
    setCurrentPageIndex((previousIndex) =>
      Math.max(previousIndex - 1, 0),
    );

    scrollToTop();
  }

  function updatePreSurveyAnswer(questionKey, value) {
    setResponses((previousResponses) => ({
      ...previousResponses,

      preSurvey: {
        ...previousResponses.preSurvey,
        [questionKey]: value,
      },
    }));
  }

  function updatePostSurveyAnswer(questionKey, value) {
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

async function submitStudy() {
  if (isSubmitting || completionCode) {
    return;
  }

  setIsSubmitting(true);
  setSubmitError("");

  const submissionData = {
    sessionId: assignment.sessionId,

    topic: assignment.topic,
    condition: assignment.condition,
    pattern: assignment.pattern,

    ageGroup: responses.preSurvey.ageGroup,
    gender: responses.preSurvey.gender,

    preStance: responses.preSurvey.preStance,
    preKnowledge:
      responses.preSurvey.topicKnowledge,

    postUnderstanding:
      responses.postSurvey.understanding,

    postNewInformation:
      responses.postSurvey.newInformation,

    postFurtherExploration:
      responses.postSurvey.furtherExploration,

    chatbotAppropriateness:
      responses.postSurvey.chatbotAppropriateness,

    chatbotTrustworthiness:
      responses.postSurvey.chatbotTrustworthiness,

    chatbotEngagement:
      responses.postSurvey.chatbotEngagement,

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
      "http://localhost:5050/api/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      },
    );

    const result = await response.json();
    console.log("Backend response:", result);

    if (!response.ok) {
      throw new Error(
        result.errors?.join(", ") ||
        result.message ||
        "回答の保存に失敗しました。",
      );
    }

    setCompletionCode(result.completionCode);
  } catch (error) {
    console.error("Submission failed:", error);

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
        <ConsentPage onNext={goNext} />
      )}

      {currentPage === "preSurvey" && (
        <PreSurveyPage
          topic={assignment.topicLabel}
          answers={responses.preSurvey}
          onAnswerChange={updatePreSurveyAnswer}
          onPrevious={goPrevious}
          onNext={goNext}
        />
      )}

      {currentPage === "experiment" && (
        <ExperimentPage
          assignment={assignment}
          onPrevious={goPrevious}
          onNext={goNext}
        />
      )}

      {currentPage === "postSurvey" && (
        <PostSurveyPage
          topic={assignment.topicLabel}
          condition={assignment.condition}
          answers={responses.postSurvey}
          onAnswerChange={updatePostSurveyAnswer}
          onPrevious={goPrevious}
          onSubmit={goNext}
        />
      )}

      {currentPage === "completion" && (
        <CompletionPage
          selectedKeyword={responses.completionCheck.keyword}
          onKeywordChange={updateCompletionKeyword}
          onSubmit={submitStudy}
          completionCode={completionCode}
          isSubmitting={isSubmitting}
          submitError={submitError}
        />
      )}
    </>
  );
}