import aiinschool from "../newsarticle/aiinschool.html?raw";
import nuclearenergy from "../newsarticle/NuclearEnergy.html?raw";
import selfdrivingcars from "../newsarticle/SelfDrivingCars.html?raw";
import underagesns from "../newsarticle/underagesns.html?raw";

import aiinschoolPattern1 from "../conversation/aiinschool/pattern1.js";
import aiinschoolPattern2 from "../conversation/aiinschool/pattern2.js";
import aiinschoolPattern3 from "../conversation/aiinschool/pattern3.js";
import aiinschoolPattern4 from "../conversation/aiinschool/pattern4.js";
import aiinschoolPattern5 from "../conversation/aiinschool/pattern5.js";

import nuclearenergyPattern1 from "../conversation/NuclearEnergy/pattern1.js";
import nuclearenergyPattern2 from "../conversation/NuclearEnergy/pattern2.js";
import nuclearenergyPattern3 from "../conversation/NuclearEnergy/pattern3.js";
import nuclearenergyPattern4 from "../conversation/NuclearEnergy/pattern4.js";
import nuclearenergyPattern5 from "../conversation/NuclearEnergy/pattern5.js";

import selfdrivingcarsPattern1 from "../conversation/SelfDrivingCars/pattern1.js";
import selfdrivingcarsPattern2 from "../conversation/SelfDrivingCars/pattern2.js";
import selfdrivingcarsPattern3 from "../conversation/SelfDrivingCars/pattern3.js";
import selfdrivingcarsPattern4 from "../conversation/SelfDrivingCars/pattern4.js";
import selfdrivingcarsPattern5 from "../conversation/SelfDrivingCars/pattern5.js";

import underagesnsPattern1 from "../conversation/underagesns/pattern1.js";
import underagesnsPattern2 from "../conversation/underagesns/pattern2.js";
import underagesnsPattern3 from "../conversation/underagesns/pattern3.js";
import underagesnsPattern4 from "../conversation/underagesns/pattern4.js";
import underagesnsPattern5 from "../conversation/underagesns/pattern5.js";

/*
 * ==================================================
 * ARTICLE CONFIGURATION
 * ==================================================
 *
 * The backend assigns the exact article ID.
 */
const ARTICLE_CONFIG = {
  aiinschool: {
    articleHtml: aiinschool,
    topicLabel: "学校教育での生成AI利用",
  },

  nuclearenergy: {
    articleHtml: nuclearenergy,
    topicLabel: "原子力発電",
  },

  selfdrivingcars: {
    articleHtml: selfdrivingcars,
    topicLabel: "自動運転",
  },

  underagesns: {
    articleHtml: underagesns,
    topicLabel: "未成年SNS利用規制",
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
 *   nuclearenergy + P03
 */
const CONVERSATION_CONFIG = {
  aiinschool: {
    topicLabel: "学校教育での生成AI利用",

    conversations: {
      P01: aiinschoolPattern1,
      P02: aiinschoolPattern2,
      P03: aiinschoolPattern3,
      P04: aiinschoolPattern4,
      P05: aiinschoolPattern5,
    },
  },

  nuclearenergy: {
    topicLabel: "原子力発電",

    conversations: {
      P01: nuclearenergyPattern1,
      P02: nuclearenergyPattern2,
      P03: nuclearenergyPattern3,
      P04: nuclearenergyPattern4,
      P05: nuclearenergyPattern5,
    },
  },

  selfdrivingcars: {
    topicLabel: "自動運転",

    conversations: {
      P01: selfdrivingcarsPattern1,
      P02: selfdrivingcarsPattern2,
      P03: selfdrivingcarsPattern3,
      P04: selfdrivingcarsPattern4,
      P05: selfdrivingcarsPattern5,
    },
  },

  underagesns: {
    topicLabel: "未成年SNS利用規制",

    conversations: {
      P01: underagesnsPattern1,
      P02: underagesnsPattern2,
      P03: underagesnsPattern3,
      P04: underagesnsPattern4,
      P05: underagesnsPattern5,
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
    parts[1] || null;

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