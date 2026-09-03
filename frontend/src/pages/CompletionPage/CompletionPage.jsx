import QuestionScale from "../../components/QuestionScale/QuestionScale";
import "./CompletionPage.css";
import PageNavigation from "../../components/PageNavigation/PageNavigation";

const keywordOptions = ["ライオン", "犬", "ワニ"];

export default function CompletionPage({
  selectedKeyword,
  onKeywordChange,
  onSubmit,
  onPrevious,
  completionCode,
  isSubmitting = false,
  submitError = "",
}) {
  const hasSelectedKeyword =
    selectedKeyword !== null &&
    selectedKeyword !== undefined &&
    selectedKeyword !== "";

  function handleSubmit() {
    if (!hasSelectedKeyword || isSubmitting || completionCode) {
      return;
    }

    onSubmit();
  }

  return (
    <main className="completion-page">
      <section className="completion-page__container">
        {!completionCode ? (
          <>
            <header className="completion-page__header">
              <h1>最終確認</h1>

              <p>
                以下の質問に回答し、「回答を送信する」ボタンを押してください。
              </p>
            </header>

            <div className="completion-page__question">
              <QuestionScale
                label="ページのどこかにキーワードが書かれています。それが何か答えてください。"
                options={keywordOptions}
                value={selectedKeyword}
                onChange={onKeywordChange}
                required
              />
            </div>

            {submitError && (
              <p className="completion-page__error" role="alert">
                {submitError}
              </p>
            )}

            {isSubmitting && (
              <p className="completion-page__status" role="status">
                回答を保存しています。画面を閉じないでください。
              </p>
            )}

            <PageNavigation
              onPrevious={onPrevious}
              onNext={handleSubmit}
              nextLabel={
                isSubmitting ? "送信中..." : "回答を送信する"
              }
              nextDisabled={
                !hasSelectedKeyword || isSubmitting
              }
            />
          </>
        ) : (
          <div className="completion-page__success">
            <h1>アンケートが完了しました</h1>

            <p>
              ご協力ありがとうございました。
            </p>

            <p>
              Yahoo!クラウドソーシングの回答画面に戻り、
              以下の回答完了コードを入力してください。
            </p>

            <div className="completion-page__code">
              {completionCode}
            </div>

            <p className="completion-page__warning">
              回答完了コードを記録してから、このページを閉じてください。
            </p>
          </div>
        )}
      </section>
    </main>
  );
}