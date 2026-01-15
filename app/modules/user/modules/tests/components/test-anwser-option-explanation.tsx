import type { AnswerProps } from "@/modules/admin/modules/questions/types";
import Markdown from "@/components/common/markdown";

interface TestAnswerOptionExplanationProps {
  answer: AnswerProps;
  allAnswers: AnswerProps[];
  hasMultipleExplanations: boolean;
}

export function TestAnswerOptionExplanation({
  answer,
  allAnswers,
  hasMultipleExplanations,
}: TestAnswerOptionExplanationProps) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      {hasMultipleExplanations && (
        <strong className="block mb-1 text-blue-900 dark:text-blue-200">
          Answer {String.fromCharCode(65 + allAnswers.indexOf(answer))}:
        </strong>
      )}
      <Markdown content={answer.content || ""} />
    </div>
  );
}
