import { useState } from "react";
import PageNavigation from "../../components/PageNavigation/PageNavigation";
import "./ConsentPage.css";

export default function ConsentPage({ onNext }) {
  const [hasConsented, setHasConsented] = useState(false);

  return (
    <main className="consent-page">
      <section className="consent-card">
        <header className="consent-header">
          <p className="consent-eyebrow">
            研究参加のご案内
          </p>

          <h1>
            ニュース記事に関するアンケート
          </h1>
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
              はじめに、ご自身や対象となる話題について簡単な質問に
              回答していただきます。その後、表示されたニュース記事などの
              コンテンツを閲覧していただき、最後に内容やご自身の意見についての
              質問に回答していただきます。
            </p>

            <p>
              ニュース記事で扱う話題についての専門的な知識は必要ありません。
              表示される内容をよく読み、ご自身の判断で回答してください。
            </p>
          </section>

          <section>
            <h2>所要時間</h2>

            <p>
              アンケートの回答には、およそ10〜15分程度かかります。
              文章を読む速度などによって、所要時間が前後する場合があります。
            </p>
          </section>

          <section>
            <h2>回答時のお願い</h2>

            <ul>
              <li>
                表示される説明やニュース記事などをよく読んだうえで
                回答してください。
              </li>

              <li>
                他のウェブサイトや生成AIなどを使用せず、
                ご自身の判断で回答してください。
              </li>

              <li>
                回答中はブラウザの「戻る」ボタンを使用しないでください。
              </li>

              <li>
                通信環境が安定した場所で回答してください。
              </li>

              <li>
                本アンケートへの参加は、原則として1人1回のみです。
              </li>
            </ul>
          </section>

          <section>
            <h2>確認問題と回答完了コードについて</h2>

            <p>
              アンケートの最後に、表示された内容を確認するための
              簡単な確認問題があります。
            </p>

            <p>
              確認問題への回答に応じて回答完了コードが表示されます。
              表示される内容をよく読み、確認問題を含むすべての質問に
              注意して回答してください。
            </p>

            <p>
              アンケート完了後は、画面に表示された回答完了コードを確認し、
              Yahoo!クラウドソーシングの回答画面に戻って、
              該当するコードを選択してください。
            </p>
          </section>

          <section>
            <h2>回答データの取り扱い</h2>

            <p>
              回答内容は研究目的のみに使用します。収集したデータは
              個人を直接特定できない形式で保存し、研究成果の発表や
              論文作成に利用する場合があります。
            </p>
          </section>

          <section>
            <h2>参加について</h2>

            <p>
              本研究への参加は任意です。参加しないことによる不利益は
              ありません。また、回答を始めた後でも、途中で参加を
              中止することができます。
            </p>

            <p>
              ただし、アンケートを最後まで完了していない場合や、
              確認問題に正しく回答できていない場合は、
              謝礼をお支払いできないことがあります。
            </p>
          </section>

          <section>
            <h2>お問い合わせ</h2>

            <p>
              実施機関：奈良先端科学技術大学院大学
              <br />
              お問い合わせ先：research.naist.s2026@gmail.com
            </p>
          </section>

          <label className="consent-checkbox">
            <input
              type="checkbox"
              checked={hasConsented}
              onChange={(event) =>
                setHasConsented(event.target.checked)
              }
            />

            <span>
              上記の説明を読み、研究への参加および回答データの利用に
              同意します。
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