import PreSurveyQuestions from "../../components/Questions/PreSurveyQuestions/PreSurveyQuestions";
import QuestionScale from "../../components/Questions/QuestionScale/QuestionScale";
import PageNavigation from "../../components/PageNavigation/PageNavigation";
import "./PreSurveyPage.css";

export default function PreSurveyPage({
  topic,
  answers,
  onAnswerChange,
  onPrevious,
  onNext,
}) {
  const questions = PreSurveyQuestions(topic);

  const allQuestionsAnswered = questions.every(
    (question) =>
      answers[question.key] !== null &&
      answers[question.key] !== undefined &&
      answers[question.key] !== "",
  );

  function handleNext() {
    if (!allQuestionsAnswered) {
      return;
    }

    onNext();
  }

  return (
    <main className="pre-survey-page">
      <section className="pre-survey-page__container">
        <header className="pre-survey-page__header">
          <h1>事前アンケート</h1>

          <p>
            以下の質問について、現在のあなたに最も当てはまる回答を
            選択してください。
          </p>
        </header>

        <div className="pre-survey-page__questions">
          {questions.map((question) => (
            <QuestionScale
              key={question.key}
              label={question.label}
              options={question.options}
              value={answers[question.key]}
              onChange={(value) =>
                onAnswerChange(question.key, value)
              }
              required
            />
          ))}
        </div>

        <PageNavigation
          onPrevious={onPrevious}
          onNext={handleNext}
          nextDisabled={!allQuestionsAnswered}
        />
      </section>
    </main>
  );
}