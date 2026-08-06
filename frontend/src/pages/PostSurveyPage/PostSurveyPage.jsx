import PostSurveyQuestions, {
  freeCommentQuestion,
} from "../../components/Questions/PostSurveyQuestions/PostSurveyQuestions";
import QuestionScale from "../../components/Questions/QuestionScale/QuestionScale";
import FreeTextArea from "../../components/Questions/FreeTextArea/FreeTextArea";
import PageNavigation from "../../components/PageNavigation/PageNavigation";
import "./PostSurveyPage.css";

export default function PostSurveyPage({
  topic,
  condition,
  answers,
  onAnswerChange,
  onPrevious,
  onSubmit,
  isSubmitting = false,
}) {
  const questions = PostSurveyQuestions(topic, condition);

  const allRequiredQuestionsAnswered = questions.every(
    (question) =>
      answers[question.key] !== null &&
      answers[question.key] !== undefined &&
      answers[question.key] !== "",
  );

  function handleSubmit() {
    if (!allRequiredQuestionsAnswered || isSubmitting) {
      return;
    }

    onSubmit();
  }

  return (
    <main className="post-survey-page">
      <section className="post-survey-page__container">
        <header className="post-survey-page__header">
          <h1>事後アンケート</h1>

          <p>
            以下の質問について、あなたの考えに最も近い回答を
            選択してください。
          </p>
        </header>

        <div className="post-survey-page__questions">
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

          <FreeTextArea
            label={freeCommentQuestion.label}
            placeholder={freeCommentQuestion.placeholder}
            value={answers.freeComment ?? ""}
            onChange={(value) =>
              onAnswerChange("freeComment", value)
            }
            maxLength={1000}
          />
        </div>

        {isSubmitting && (
          <p className="post-survey-page__submitting" role="status">
            回答を送信しています。画面を閉じないでください。
          </p>
        )}

        <PageNavigation
          onPrevious={onPrevious}
          onNext={handleSubmit}
          previousDisabled={isSubmitting}
          nextDisabled={
            !allRequiredQuestionsAnswered || isSubmitting
          }
          nextLabel={
            isSubmitting ? "送信中..." : "回答を送信する"
          }
        />
      </section>
    </main>
  );
}