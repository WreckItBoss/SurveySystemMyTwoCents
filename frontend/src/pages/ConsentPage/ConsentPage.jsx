import { useState } from "react";
import PageNavigation from "../../components/questionnaire/PageNavigation/PageNavigation";
import "./ConsentPage.css";

export default function ConsentPage({ onNext }) {
  const [hasConsented, setHasConsented] = useState(false);

  return (
    <main className="consent-page">
      <section className="consent-card">
        <header className="consent-header">
          <p className="consent-eyebrow">研究参加のご案内</p>
          <h1>ニュース記事に関するアンケート</h1>
        </header>

        <div className="consent-content">
          <section>
            <h2>研究の目的</h2>
            <p>
              本研究では、ニュース記事とともに異なる立場からの議論を提示する
              システム「MyTwoCents」が、ニュース内容の理解や多角的な視点の
              獲得、意見の再検討にどのような影響を与えるかを調査します。
            </p>
          </section>

          <section>
            <h2>アンケートの内容</h2>
            <p>
              はじめに、あなた自身や対象となる話題について簡単な質問に
              回答していただきます。その後、ニュース記事またはニュース記事と
              AIエージェントによる議論を閲覧し、最後に内容についての質問に
              回答していただきます。
            </p>
          </section>

          <section>
            <h2>所要時間</h2>
            <p>アンケートの回答には、およそ10〜15分程度かかります。</p>
          </section>

          <section>
            <h2>回答データの取り扱い</h2>
            <p>
              回答内容は研究目的のみに使用します。収集したデータは個人を
              特定できない形式で保存し、研究成果の発表や論文作成に利用する
              場合があります。
            </p>
          </section>

          <section>
            <h2>参加について</h2>
            <p>
              本研究への参加は任意です。参加しないことによる不利益は
              ありません。また、回答の途中で参加を中止することもできます。
            </p>
          </section>

          <section>
            <h2>回答完了コードについて</h2>
            <p>
              すべての質問への回答が完了すると、回答完了コードが表示されます。
              Yahoo!クラウドソーシングの回答画面に戻り、表示されたコードを
              入力してください。
            </p>
          </section>

          <label className="consent-checkbox">
            <input
              type="checkbox"
              checked={hasConsented}
              onChange={(event) => setHasConsented(event.target.checked)}
            />

            <span>
              上記の説明を読み、研究への参加および回答データの利用に同意します。
            </span>
          </label>
        </div>

        <PageNavigation
          onNext={onNext}
          nextDisabled={!hasConsented}
          nextLabel="同意して次へ"
        />
      </section>
    </main>
  );
}