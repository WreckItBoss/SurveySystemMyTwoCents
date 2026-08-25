import { useState } from "react";
import PageNavigation from "../../components/PageNavigation/PageNavigation";
import "./ConsentPage.css";

export default function ConsentPage({
  onNext,
  isLoading = false,
  assignmentError = "",
  timeoutMessage = "",
}) {
  const [hasConsented, setHasConsented] =
    useState(false);

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
            <h2>作業内容</h2>

            <p>
              ニュース記事を読んでいただき、その内容や話題に対する
              ご意見について回答していただくアンケートです。
              専門的な知識は必要ありません。
            </p>

            <p>
              タスクでは、はじめにご自身や対象となる話題について
              簡単な質問に回答していただきます。その後、ニュース記事を閲覧していただき、
              最後に内容についての質問に回答していただきます。
            </p>
          </section>

          <section>
            <h2>作業の流れ</h2>

            <ol>
              <li>
                研究およびタスク内容の説明を読み、参加に同意する
              </li>

              <li>
                ご自身や対象となる話題についての事前アンケートに回答する
              </li>

              <li>
                表示されたニュース記事をよく読む
              </li>

              <li>
                内容やご自身の意見についての事後アンケートに回答する
              </li>

              <li>
                内容に関する確認問題に回答する
              </li>

              <li>
                画面に表示された回答完了コードを確認する
              </li>

              <li>
                Yahoo!クラウドソーシングの回答画面に戻り、
                表示された回答完了コードを選択して回答を送信する
              </li>
            </ol>
          </section>

          <section>
            <h2>所要時間</h2>

            <p>
              約10〜15分
              <br />
              ※文章を読む速度などによって、
              所要時間が前後する場合があります。
              <br />
              ※回答開始から40分を経過すると、セッションが終了し、回答を続けることができなくなります。
            </p>
          </section>

          <section>
            <h2>募集対象</h2>

            <p>
              以下の条件をすべて満たす方を対象とします。
            </p>

            <ul>
              <li>
                日本語の文章を読むことができる方
              </li>

              <li>
                パソコンまたはスマートフォンからタスクに参加できる方
              </li>

              <li>
                説明およびニュース記事などの内容をよく読み、
                ご自身で回答できる方
              </li>
            </ul>

            <p>
              ※ニュース記事で扱う話題についての専門的な知識は
              必要ありません。
            </p>
          </section>

          <section>
            <h2>回答時のお願い</h2>

            <ul>
              <li>
                表示される説明やニュース記事をよく読んだうえで
                回答してください。
              </li>

              <li>
                他のウェブサイトや生成AIなどを使用せず、
                ご自身の判断で回答してください。
              </li>

              <li>
                回答中は、ブラウザの「戻る」ボタンを使用しないでください。
              </li>

              <li>
                通信環境が安定した場所で回答してください。
              </li>

              <li>
                タスクへの参加は、原則として1人1回のみです。
              </li>

              <li>
                タスクの内容や確認問題の答え、回答完了コードなどを
                第三者に共有しないでください。
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
              ニュース記事の内容を十分に確認せずに回答した場合、
              正しい回答完了コードが表示されず、
              Yahoo!クラウドソーシング上で回答が承認されない場合があります。
            </p>

            <p>
              そのため、表示されるニュース記事をよく読み、
              確認問題を含むすべての質問に注意して回答してください。
            </p>

            <p>
              アンケート完了後は、画面に表示された回答完了コードを確認し、
              Yahoo!クラウドソーシングの回答画面に戻って、
              該当するコードを選択してください。
            </p>
          </section>

          <section>
            <h2>回答を承認できない場合</h2>

            <p>
              以下に該当する場合は、回答を承認できないことがあります。
            </p>

            <ul>
              <li>
                タスクが最後まで完了していない場合
              </li>

              <li>
                正しい回答完了コードが選択されていない場合
              </li>

              <li>
                同一人物による複数回の回答が確認された場合
              </li>

              <li>
                説明やニュース記事を十分に読まずに
                回答したと考えられる場合
              </li>

              <li>
                極端に短い時間で回答している場合
              </li>

              <li>
                回答内容に明らかな矛盾や不自然な回答が多数含まれる場合
              </li>

              <li>
                不正な方法や自動化ツールを使用して回答した場合
              </li>
            </ul>
          </section>

          <section>
            <h2>回答データの取り扱い</h2>

            <p>
              回答データは研究目的で利用します。
              研究成果を論文や学会発表などで公表する場合がありますが、
              個人を直接特定できる形で公表することはありません。
            </p>

            <p>
              タスク内に表示される研究説明を確認し、
              内容に同意した場合にのみ参加してください。
            </p>
          </section>

          <section>
            <h2>注意事項</h2>

            <p>
              本研究への参加は任意です。回答を始めた後でも、
              途中で参加を中止することができます。
              ただし、タスクを最後まで完了していない場合や、
              確認問題に正しく回答できていない場合は、
              謝礼をお支払いできないことがあります。
            </p>
          </section>

          <section>
            <h2>実施機関・お問い合わせ先</h2>

            <p>
              実施機関：奈良先端科学技術大学院大学
            </p>
          </section>
          {timeoutMessage && (
            <p
              className="consent-timeout-message"
              role="status"
            >
              {timeoutMessage}
            </p>
          )}
          {assignmentError && (
            <p
              className="consent-error"
              role="alert"
            >
              {assignmentError}
            </p>
          )}

          <label className="consent-checkbox">
            <input
              type="checkbox"
              checked={hasConsented}
              onChange={(event) =>
                setHasConsented(
                  event.target.checked,
                )
              }
              disabled={isLoading}
            />

            <span>
              上記の説明を読み、研究への参加および
              回答データの利用に同意します。
            </span>
          </label>
        </div>

        <PageNavigation
          onNext={onNext}
          nextDisabled={
            !hasConsented ||
            isLoading ||
            Boolean(assignmentError)
          }
          nextLabel={
            isLoading
              ? "確認中..."
              : "同意して次へ"
          }
        />
      </section>
    </main>
  );
}