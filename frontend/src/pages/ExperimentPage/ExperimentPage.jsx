import NewsOnly from "../../components/conditions/NewsOnly/NewsOnly";

export default function ExperimentPage({
  assignment,
  onPrevious,
  onNext,
}) {
  if (!assignment) {
    return <p>実験内容を読み込んでいます...</p>;
  }

  return (
    <NewsOnly
      topic={assignment.topic}
      article={assignment.article}
      onPrevious={onPrevious}
      onNext={onNext}
    />
  );
}