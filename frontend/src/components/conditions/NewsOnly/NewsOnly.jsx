import aiinschool from "./aiinschool.html?raw";
import nuclearenergy from "./nuclearenergy.html?raw";
import selfdrivingcars from "./SelfDrivingCars.html?raw";
import underagesns from "./underagesns.html?raw";

import PageNavigation from "../../PageNavigation/PageNavigation";

// import "./NewsOnly.css";

const articles = {
  aiinschool,
  nuclearenergy,
  selfdrivingcars,
  underagesns,
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