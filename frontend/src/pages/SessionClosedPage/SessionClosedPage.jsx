import "./SessionClosedPage.css";

export default function SessionClosedPage() {
  return (
    <main className="session-closed-page">
      <section className="session-closed-card">
        <p className="session-closed-eyebrow">
          回答時間終了
        </p>

        <h1>
          アンケートの回答時間が終了しました
        </h1>

        <div className="session-closed-content">
          <p>
            回答開始から40分が経過したため、
            このアンケートの回答を続けることはできません。
          </p>

          <p>
            このページを閉じて、
            Yahoo!クラウドソーシングの画面に戻ってください。
          </p>
        </div>
      </section>
    </main>
  );
}