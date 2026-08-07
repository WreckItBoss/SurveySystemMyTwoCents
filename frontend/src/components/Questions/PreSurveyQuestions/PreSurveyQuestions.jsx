export default function PreSurveyQuestions(topicLabel) {
  return [
    {
      key: "ageGroup",
      label: "あなたの年齢を教えてください。",
      options: [
        { value: "15-19", label: "15〜19歳" },
        { value: "20-29", label: "20〜29歳" },
        { value: "30-39", label: "30〜39歳" },
        { value: "40-49", label: "40〜49歳" },
        { value: "50-59", label: "50〜59歳" },
        { value: "60+", label: "60歳以上" },
      ],
    },
    {
      key: "gender",
      label: "あなたの性別を教えてください。",
      options: [
        { value: "male", label: "男性" },
        { value: "female", label: "女性" },
        { value: "other", label: "その他" },
      ],
    },
    {
      key: "preStance",
      label: `この後、「${topicLabel}」に関するニュースを読んでいただきます。現時点で、あなたは「${topicLabel}」に対して賛成ですか、反対ですか。`,
      options: [
        { value: 4, label: "強く賛成" },
        { value: 3, label: "やや賛成" },
        { value: 2, label: "やや反対" },
        { value: 1, label: "強く反対" },
      ],
    },
    {
      key: "topicKnowledge",
      label: `現時点で、あなたは「${topicLabel}」に関してどれほど知っていますか。`,
      options: [
        { value: 1, label: "全く知らない" },
        { value: 2, label: "あまり知らない" },
        { value: 3, label: "どちらともいえない" },
        { value: 4, label: "やや知っている" },
        { value: 5, label: "よく知っている" },
      ],
    },
  ];
}