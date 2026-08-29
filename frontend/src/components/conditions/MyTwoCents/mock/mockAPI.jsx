import nuclearArticle from "../newsarticle/NuclearEnergy.html?raw";
import casinoArticle from "../newsarticle/CasinoIR.html?raw";

import nuclearPattern1 from "../conversation/NuclearEnergy/pattern1.js";
import nuclearPattern2 from "../conversation/NuclearEnergy/pattern2.js";
import nuclearPattern3 from "../conversation/NuclearEnergy/pattern3.js";
import nuclearPattern4 from "../conversation/NuclearEnergy/pattern4.js";
import nuclearPattern5 from "../conversation/NuclearEnergy/pattern5.js";

import casinoPattern1 from "../conversation/CasinoIR/pattern1.js";
import casinoPattern2 from "../conversation/CasinoIR/pattern2.js";
import casinoPattern3 from "../conversation/CasinoIR/pattern3.js";
import casinoPattern4 from "../conversation/CasinoIR/pattern4.js";
import casinoPattern5 from "../conversation/CasinoIR/pattern5.js";

/*
 * ==================================================
 * ARTICLE CONFIGURATION
 * ==================================================
 *
 * The backend assigns the exact article ID.
 *
 * Only these two articles are used in the
 * current experiment.
 */
const ARTICLE_CONFIG = {
  nuclearenergy1: {
    articleHtml: nuclearArticle,
    topicLabel: "原子力発電",
  },

  casinoir2: {
    articleHtml: casinoArticle,
    topicLabel: "カジノ・IR",
  },
};

/*
 * ==================================================
 * CONVERSATION CONFIGURATION
 * ==================================================
 *
 * Conversations are selected using:
 *
 *   topic + pattern
 *
 * Example:
 *   casinoir + P03
 */
const CONVERSATION_CONFIG = {
  nuclearenergy: {
    topicLabel: "原子力発電",

    conversations: {
      P01: nuclearPattern1,
      P02: nuclearPattern2,
      P03: nuclearPattern3,
      P04: nuclearPattern4,
      P05: nuclearPattern5,
    },
  },

  casinoir: {
    topicLabel: "カジノ・IR",

    conversations: {
      P01: casinoPattern1,
      P02: casinoPattern2,
      P03: casinoPattern3,
      P04: casinoPattern4,
      P05: casinoPattern5,
    },
  },
};

/*
 * ==================================================
 * ARTICLE
 * ==================================================
 */
export async function getArticle(articleId) {
  const config =
    ARTICLE_CONFIG[articleId];

  if (!config) {
    throw new Error(
      `Invalid or missing article: ${articleId}`,
    );
  }

  const html = config.articleHtml;

  const doc = new DOMParser().parseFromString(
    html,
    "text/html",
  );

  const title =
    doc
      .querySelector("header h1")
      ?.textContent.trim() ??
    "Untitled";

  const metaText =
    doc
      .querySelector(".meta")
      ?.textContent.trim() ??
    "";

  const parts = metaText
    .split("・")
    .map((part) => part.trim());

  const source =
    parts[0] || "";

  const date =
    parts[2] || null;

  const articleEl =
    doc.querySelector("article");

  const contentHtml =
    articleEl
      ? articleEl.innerHTML.trim()
      : "<p>(No content)</p>";

  return {
    id: articleId,
    title,
    source,
    topic: config.topicLabel,
    date,
    contentHtml,
  };
}

/*
 * ==================================================
 * DEBATE
 * ==================================================
 */
export async function generateDebate(
  topic,
  pattern,
) {
  const topicConfig =
    CONVERSATION_CONFIG[topic];

  if (!topicConfig) {
    throw new Error(
      `Invalid or missing topic: ${topic}`,
    );
  }

  const conversation =
    topicConfig.conversations[pattern];

  if (!conversation) {
    throw new Error(
      `Invalid or missing conversation pattern: ${pattern}`,
    );
  }

  return {
    topics: [
      topicConfig.topicLabel,
    ],

    agents:
      conversation.agents,

    messages:
      conversation.messages,
  };
}