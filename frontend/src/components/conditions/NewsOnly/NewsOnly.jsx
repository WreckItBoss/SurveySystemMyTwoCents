import nuclearEnergyHtml from "./nuclearenergy.html?raw";
import selfDrivingCarsHtml from "./selfdrivingcars.html?raw";
import surveillanceHtml from "./surveillance.html?raw";

import "./NewsOnly.css";

const articles = {
  nuclearenergy: nuclearEnergyHtml,
  selfdrivingcars: selfDrivingCarsHtml,
  surveillance: surveillanceHtml,
};

export default function NewsOnly({ topic }) {
  const articleHtml = articles[topic];

  if (!articleHtml) {
    return <p>ニュース記事が見つかりませんでした。</p>;
  }

  return (
    <div className="news-only">
      <article
        className="news-only__article"
        dangerouslySetInnerHTML={{ __html: articleHtml }}
      />
    </div>
  );
}