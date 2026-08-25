import nuclearEnergy1Html from "./nuclearenergy1.html?raw";
import nuclearEnergy2Html from "./nuclearenergy2.html?raw";

import immigration1Html from "./immigration1.html?raw";
import immigration2Html from "./immigration2.html?raw";

import usingBallAtPark1Html from "./usingballatpark1.html?raw";
import usingBallAtPark2Html from "./usingballatpark2.html?raw";

import casinoIr1Html from "./casinoir1.html?raw";
import casinoIr2Html from "./casinoir2.html?raw";

import decreaseRicePrice1Html from "./decreasericeprice1.html?raw";
import decreaseRicePrice2Html from "./decreasericeprice2.html?raw";

import PageNavigation from "../../PageNavigation/PageNavigation";

// import "./NewsOnly.css";

const articles = {
  nuclearenergy1: nuclearEnergy1Html,
  nuclearenergy2: nuclearEnergy2Html,

  immigration1: immigration1Html,
  immigration2: immigration2Html,

  usingballatpark1: usingBallAtPark1Html,
  usingballatpark2: usingBallAtPark2Html,

  casinoir1: casinoIr1Html,
  casinoir2: casinoIr2Html,

  decreasericeprice1: decreaseRicePrice1Html,
  decreasericeprice2: decreaseRicePrice2Html,
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