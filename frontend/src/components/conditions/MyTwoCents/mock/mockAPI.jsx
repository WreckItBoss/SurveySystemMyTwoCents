import aiCopyright from "../newsarticle/aiCopyright.html?raw";
import aiinschool from "../newsarticle/aiinschool.html?raw";
import immigration from "../newsarticle/immigration.html?raw";
import underagesns from "../newsarticle/underagesns.html?raw";

import aiCopyrightPattern1 from "../conversation/aiCopyright/pattern1.js";
import aiCopyrightPattern2 from "../conversation/aiCopyright/pattern2.js";
import aiCopyrightPattern3 from "../conversation/aiCopyright/pattern3.js";
import aiCopyrightPattern4 from "../conversation/aiCopyright/pattern4.js";
import aiCopyrightPattern5 from "../conversation/aiCopyright/pattern5.js";

import aiinschoolPattern1 from "../conversation/aiinschool/pattern1.js";
import aiinschoolPattern2 from "../conversation/aiinschool/pattern2.js";
import aiinschoolPattern3 from "../conversation/aiinschool/pattern3.js";
import aiinschoolPattern4 from "../conversation/aiinschool/pattern4.js";
import aiinschoolPattern5 from "../conversation/aiinschool/pattern5.js";

import immigrationPattern1 from "../conversation/immigration/pattern1.js";
import immigrationPattern2 from "../conversation/immigration/pattern2.js";
import immigrationPattern3 from "../conversation/immigration/pattern3.js";
import immigrationPattern4 from "../conversation/immigration/pattern4.js";
import immigrationPattern5 from "../conversation/immigration/pattern5.js";

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
  aiCopyright: {
    articleHtml: aiCopyright,
    topicLabel: "生成AIに対する著作権規制の強化",
  },

  aiinschool: {
    articleHtml: aiinschool,
    topicLabel: "学校教育での生成AI利用",
  },

  immigration: {
    articleHtml: immigration,
    topicLabel: "移民受け入れ",
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
 *   aiCopyright + P03
 */
const CONVERSATION_CONFIG = {
  aiCopyright: {
    topicLabel: "生成AIに対する著作権規制の強化",

    conversations: {
      P01: aiCopyrightPattern1,
      P02: aiCopyrightPattern2,
      P03: aiCopyrightPattern3,
      P04: aiCopyrightPattern4,
      P05: aiCopyrightPattern5,
    },
  },

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

  immigration: {
    topicLabel: "移民受け入れ",

    conversations: {
      P01: immigrationPattern1,
      P02: immigrationPattern2,
      P03: immigrationPattern3,
      P04: immigrationPattern4,
      P05: immigrationPattern5,
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