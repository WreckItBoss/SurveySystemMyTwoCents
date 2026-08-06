// src/mock/mockAPI.jsx
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
const MOCK_ARTICLE = "NuclearEnergy";

const MOCK_CONFIG = {
  NuclearEnergy: {
    file: "/NuclearEnergy.html",
    topic: "原子力発電",
    conversations: {
      1: nuclearPattern1,
      2: nuclearPattern2,
      3: nuclearPattern3,
      4: nuclearPattern4,
      5: nuclearPattern5,
    },
  },

  SelfDrivingCars: {
    file: "/SelfDrivingCars.html",
    topic: "自動運転",
    conversations: {
      1: selfDrivingPattern1,
      2: selfDrivingPattern2,
      3: selfDrivingPattern3,
      4: selfDrivingPattern4,
      5: selfDrivingPattern5,
    },
  },

  Surveillance: {
    file: "/Surveillance.html",
    topic: "超監視時代",
    conversations: {
      1: surveillancePattern1,
      2: surveillancePattern2,
      3: surveillancePattern3,
      4: surveillancePattern4,
      5: surveillancePattern5,
    },
  },
};

function getSelectedConfig() {
  const params = new URLSearchParams(window.location.search);

  const topicKey = params.get("topic");
  const patternNumber = Number(params.get("pattern"));

  const topicConfig = MOCK_CONFIG[topicKey];

  if (!topicConfig) {
    throw new Error("Invalid or missing topic.");
  }

  const conversation =
    topicConfig.conversations[patternNumber];

  if (!conversation) {
    throw new Error("Invalid or missing conversation pattern.");
  }

  return {
    ...topicConfig,
    conversation,
  };
}

export async function getArticle() {
  const config = getSelectedConfig();

  const res = await fetch(config.file);

  if (!res.ok) {
    throw new Error(`Failed to load ${config.file}`);
  }

  const html = await res.text();
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
    topic: config.topic,
    date,
    contentHtml,
  };
}

export async function generateDebate() {
  const config = getSelectedConfig();

  return {
    topics: [config.topic],
    agents: config.conversation.agents,
    messages: config.conversation.messages,
  };
}