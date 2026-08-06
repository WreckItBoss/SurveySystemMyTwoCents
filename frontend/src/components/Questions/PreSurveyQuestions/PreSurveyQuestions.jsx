export const ageQuestion = {
  key: "ageGroup",
  label: "あなたの年齢を教えてください。",
  options: [
    "15〜19歳",
    "20〜29歳",
    "30〜39歳",
    "40〜49歳",
    "50〜59歳",
    "60歳以上",
  ],
};

export const genderQuestion = {
  key: "gender",
  label: "あなたの性別を教えてください。",
  options: [
    "男性",
    "女性",
    "その他",
  ],
};

export function createStanceQuestion(topic) {
  return {
    key: "preStance",
    label: `この後、「${topic}」に関するニュースを読んでいただきます。現時点で、あなたは「${topic}」に対して賛成ですか、反対ですか。`,
    options: [
      "強く賛成",
      "やや賛成",
      "やや反対",
      "強く反対",
    ],
  };
}

export function createKnowledgeQuestion(topic) {
  return {
    key: "topicKnowledge",
    label: `現時点で、あなたは「${topic}」に関してどれほど知っていますか。`,
    options: [
      "全く知らない",
      "あまり知らない",
      "どちらともいえない",
      "やや知っている",
      "よく知っている",
    ],
  };
}