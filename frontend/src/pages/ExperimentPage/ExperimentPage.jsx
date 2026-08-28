import MyTwoCents from "../../components/conditions/MyTwoCents/MyTwoCents";

export default function ExperimentPage({
  assignment,
  onPrevious,
  onNext,
}) {
  if (!assignment) {
    return <p>実験内容を読み込んでいます...</p>;
  }

  if (assignment.condition !== "mytwocents") {
    return (
      <p>
        実験条件が正しく設定されていません。
      </p>
    );
  }

  return (
    <MyTwoCents
      topic={assignment.topic}
      article={assignment.article}
      pattern={assignment.pattern}
      onPrevious={onPrevious}
      onNext={onNext}
    />
  );
}