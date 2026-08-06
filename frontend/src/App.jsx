import { useState } from "react";

import ConsentPage from "./pages/ConsentPage/ConsentPage";
import PreSurveyPage from "./pages/PreSurveyPage/PreSurveyPage";
import ExperimentPage from "./pages/ExperimentPage/ExperimentPage";
import PostSurveyPage from "./pages/PostSurveyPage/PostSurveyPage";
import CompletionPage from "./pages/CompletionPage/CompletionPage";

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
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Temporary hardcoded assignment.
  // This will later come from the backend.
  const [assignment] = useState({
    sessionId: "TEMP-SESSION-001",
    topic: "原子力発電",
    condition: "mytwocents",
    pattern: "P01",
  });

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
      responses,
    };

    try {
      // Temporary frontend-only simulation.
      console.log("Submitting study data:", submissionData);

      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });

      // Temporary code until the backend generates one.
      setCompletionCode("MTC8264");
    } catch (error) {
      console.error("Submission failed:", error);

      setSubmitError(
        "回答の保存に失敗しました。通信環境をご確認のうえ、もう一度お試しください。",
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
          topic={assignment.topic}
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
          topic={assignment.topic}
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