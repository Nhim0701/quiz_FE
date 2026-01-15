import ReactMarkdown from "react-markdown";
import type { AnswerProps } from "@/modules/admin/modules/questions/types";

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
      <ReactMarkdown
        components={{
          p: ({ node, ...props }) => (
            <p
              className="mb-2 leading-relaxed text-blue-800 dark:text-blue-300"
              {...props}
            />
          ),
          ul: ({ node, ...props }) => (
            <ul
              className="list-disc list-inside mb-2 space-y-1 text-blue-800 dark:text-blue-300"
              {...props}
            />
          ),
          ol: ({ node, ...props }) => (
            <ol
              className="list-decimal list-inside mb-2 space-y-1 text-blue-800 dark:text-blue-300"
              {...props}
            />
          ),
          // eslint-disable-next-line jsx-a11y/no-redundant-roles
          li: ({ node, ...props }) => (
            <li
              className="leading-relaxed text-blue-800 dark:text-blue-300"
              {...props}
            />
          ),
          code: ({ node, ...props }) => (
            <code
              className="block bg-blue-100 dark:bg-blue-800 text-blue-900 dark:text-blue-100 p-2 rounded text-xs font-mono overflow-x-auto"
              {...props}
            />
          ),
          strong: ({ node, ...props }) => (
            <strong
              className="font-bold text-blue-900 dark:text-blue-200"
              {...props}
            />
          ),
          em: ({ node, ...props }) => (
            <em
              className="italic text-blue-800 dark:text-blue-300"
              {...props}
            />
          ),
          a: ({ node, ...props }) => (
            <a
              className="text-blue-600 dark:text-blue-400 hover:underline"
              {...props}
            />
          ),
          h1: ({ node, ...props }) => (
            <h1
              className="text-base sm:text-lg font-bold mb-2 text-blue-900 dark:text-blue-200"
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className="text-sm sm:text-base font-bold mb-2 text-blue-900 dark:text-blue-200"
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              className="text-xs sm:text-sm font-bold mb-1 text-blue-900 dark:text-blue-200"
              {...props}
            />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-blue-300 dark:border-blue-700 pl-3 italic my-2 text-blue-800 dark:text-blue-300"
              {...props}
            />
          ),
        }}
      >
        {answer.explanation ?? ""}
      </ReactMarkdown>
    </div>
  );
}
