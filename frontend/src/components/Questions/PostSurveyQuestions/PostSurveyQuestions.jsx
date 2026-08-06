const agreementOptions = [
  "全くそう思わない",
  "あまりそう思わない",
  "どちらともいえない",
  "少しそう思う",
  "とてもそう思う",
];

const understandingOptions = [
  "全く理解できなかった",
  "あまり理解できなかった",
  "どちらともいえない",
  "少し理解できた",
  "とても理解できた",
];

const stanceOptions = [
  "強く賛成",
  "やや賛成",
  "やや反対",
  "強く反対",
];

export function createPostSurveyQuestions(topic, condition) {
  const isMyTwoCents = condition === "mytwocents";

  const contentLabel = isMyTwoCents
    ? "ニュース記事やチャットボット"
    : "ニュース記事";

  const commonQuestions = [
    {
      key: "understanding",
      label: "ニュース記事の内容を理解できましたか。",
      options: understandingOptions,
    },
    {
      key: "newInformation",
      label: `${contentLabel}を読むことで、新しい情報を知ることができましたか。`,
      options: agreementOptions,
    },
    {
      key: "furtherExploration",
      label: `${contentLabel}を読むことで、関連する話題や他の記事をさらに調べてみたいという気持ちになりましたか。`,
      options: agreementOptions,
    },
  ];

  const myTwoCentsQuestions = [
    {
      key: "chatbotAppropriateness",
      label: "チャットボットの内容は妥当だと思いますか。",
      options: agreementOptions,
    },
    {
      key: "chatbotTrustworthiness",
      label: "チャットボットが提示した情報を信頼できると感じましたか。",
      options: agreementOptions,
    },
    {
      key: "chatbotEngagement",
      label:
        "チャットボットの会話は、最後まで興味を持って読むことができましたか。",
      options: agreementOptions,
    },
  ];

  const finalQuestions = [
    {
      key: "postStance",
      label: `ニュース記事を読んだ上で、あなたの意見をお聞かせください。「${topic}」について賛成ですか、反対ですか。`,
      options: stanceOptions,
    },
  ];

  return [
    ...commonQuestions,
    ...(isMyTwoCents ? myTwoCentsQuestions : []),
    ...finalQuestions,
  ];
}

export const freeCommentQuestion = {
  key: "freeComment",
  label: "ご意見・ご感想がございましたら、ご自由にご記入ください。",
  placeholder: "こちらにご記入ください。",
};