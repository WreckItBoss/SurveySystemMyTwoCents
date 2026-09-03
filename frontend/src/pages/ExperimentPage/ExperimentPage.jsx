import MyTwoCents from "../../components/conditions/MyTwoCents/MyTwoCents";
import NewsOnly from "../../components/conditions/NewsOnly/NewsOnly";

export default function ExperimentPage({
  assignment,
  onPrevious,
  onNext,
}) {
  if (!assignment) {
    return <p>実験内容を読み込んでいます...</p>;
  }

  if (assignment.condition === "mytwocents") {
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

  if (assignment.condition === "news") {
    return (
      <NewsOnly
        article={assignment.article}
        onPrevious={onPrevious}
        onNext={onNext}
      />
    );
  }

  return (
    <p>
      実験条件が正しく設定されていません。
    </p>
  );
}