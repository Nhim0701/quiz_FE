import type { AnswerProps } from "@/modules/admin/modules/questions/types";
import Markdown from "@/components/common/markdown";

interface TestAnswerOptionExplanationProps {
  content: string;
  index: number;
}

export function TestAnswerOptionExplanation({
  content,
  index,
}: TestAnswerOptionExplanationProps) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <strong className="block mb-1 text-blue-900 dark:text-blue-200">
        Answer {String.fromCharCode(65 + index)}:
      </strong>
      <Markdown content={content} />
    </div>
  );
}
