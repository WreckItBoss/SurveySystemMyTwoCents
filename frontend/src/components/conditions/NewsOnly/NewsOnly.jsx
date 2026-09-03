import aiCopyright from "./aiCopyright.html?raw";
import aiinschool from "./aiinschool.html?raw";

import immigration from "./immigration.html?raw";

import underagesns from "./underagesns.html?raw";

// import "./NewsOnly.css";

const articles = {
  aiCopyright: aiCopyright,
  aiinschool: aiinschool,

  immigration: immigration,

  underagesns: underagesns,
};

export default function NewsOnly({
  article,
  onPrevious,
  onNext,
}) {
  const articleHtml = articles[article];

  if (!articleHtml) {
    return <p>ニュース記事が見つかりませんでした。</p>;
  }

  return (
    <div className="news-only">
      <article
        className="news-only__article"
        dangerouslySetInnerHTML={{
          __html: articleHtml,
        }}
      />

      <PageNavigation
        onPrevious={onPrevious}
        onNext={onNext}
        nextLabel="事後アンケートへ進む"
      />
    </div>
  );
}