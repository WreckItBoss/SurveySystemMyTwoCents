import nuclearArticle from "../newsarticle/NuclearEnergy.html?raw";
import selfDrivingArticle from "../newsarticle/SelfDrivingCars.html?raw";
import surveillanceArticle from "../newsarticle/Surveillance.html?raw";

import nuclearPattern1 from "../conversation/NuclearEnergy/pattern1.js";
import nuclearPattern2 from "../conversation/NuclearEnergy/pattern2.js";
import nuclearPattern3 from "../conversation/NuclearEnergy/pattern3.js";
import nuclearPattern4 from "../conversation/NuclearEnergy/pattern4.js";
import nuclearPattern5 from "../conversation/NuclearEnergy/pattern5.js";

import selfDrivingPattern1 from "../conversation/SelfDrivingCars/pattern1.js";
import selfDrivingPattern2 from "../conversation/SelfDrivingCars/pattern2.js";
import selfDrivingPattern3 from "../conversation/SelfDrivingCars/pattern3.js";
import selfDrivingPattern4 from "../conversation/SelfDrivingCars/pattern4.js";
import selfDrivingPattern5 from "../conversation/SelfDrivingCars/pattern5.js";

import surveillancePattern1 from "../conversation/Surveillance/pattern1.js";
import surveillancePattern2 from "../conversation/Surveillance/pattern2.js";
import surveillancePattern3 from "../conversation/Surveillance/pattern3.js";
import surveillancePattern4 from "../conversation/Surveillance/pattern4.js";
import surveillancePattern5 from "../conversation/Surveillance/pattern5.js";

const MOCK_CONFIG = {
  nuclearenergy: {
    articleHtml: nuclearArticle,
    topicLabel: "原子力発電",
    conversations: {
      P01: nuclearPattern1,
      P02: nuclearPattern2,
      P03: nuclearPattern3,
      P04: nuclearPattern4,
      P05: nuclearPattern5,
    },
  },

  selfdrivingcars: {
    articleHtml: selfDrivingArticle,
    topicLabel: "自動運転",
    conversations: {
      P01: selfDrivingPattern1,
      P02: selfDrivingPattern2,
      P03: selfDrivingPattern3,
      P04: selfDrivingPattern4,
      P05: selfDrivingPattern5,
    },
  },

  surveillance: {
    articleHtml: surveillanceArticle,
    topicLabel: "超監視時代",
    conversations: {
      P01: surveillancePattern1,
      P02: surveillancePattern2,
      P03: surveillancePattern3,
      P04: surveillancePattern4,
      P05: surveillancePattern5,
    },
  },
};

function getSelectedConfig(topic, pattern) {
  const topicConfig = MOCK_CONFIG[topic];

  if (!topicConfig) {
    throw new Error(`Invalid or missing topic: ${topic}`);
  }

  const conversation = topicConfig.conversations[pattern];

  if (!conversation) {
    throw new Error(
      `Invalid or missing conversation pattern: ${pattern}`,
    );
  }

  return {
    ...topicConfig,
    conversation,
  };
}

export async function getArticle(topic, pattern) {
  const config = getSelectedConfig(topic, pattern);

  const html = config.articleHtml;

  const doc = new DOMParser().parseFromString(
    html,
    "text/html",
  );

  const title =
    doc.querySelector("header h1")?.textContent.trim() ??
    "Untitled";

  const metaText =
    doc.querySelector(".meta")?.textContent.trim() ?? "";

  const parts = metaText
    .split("・")
    .map((part) => part.trim());

  const source = parts[0] || "";
  const date = parts[2] || null;

  const articleEl = doc.querySelector("article");

  const contentHtml = articleEl
    ? articleEl.innerHTML.trim()
    : "<p>(No content)</p>";

  return {
    id: "news-1",
    title,
    source,
    topic: config.topicLabel,
    date,
    contentHtml,
  };
}

export async function generateDebate(topic, pattern) {
  const config = getSelectedConfig(topic, pattern);

  return {
    topics: [config.topicLabel],
    agents: config.conversation.agents,
    messages: config.conversation.messages,
  };
}