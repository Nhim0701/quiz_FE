import { Edit, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Question } from "@/types/content";

interface QuestionCardProps {
  question: Question;
  onEdit?: (question: Question) => void;
}

const ANSWER_LABELS = ["A", "B", "C", "D", "E", "F"];

export function QuestionCard({ question, onEdit }: QuestionCardProps) {
  const correctAnswers = question.answers
    .map((answer, index) => answer.isCorrect ? ANSWER_LABELS[index] : null)
    .filter(Boolean)
    .join(", ");

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">
              {question.category}
            </span>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
              {question.test}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ID: {question.id}
            </span>
            {question.isMultipleChoice && (
              <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium rounded">
                Multiple Choice
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {question.content}
          </h3>
        </div>

        <div className="flex gap-2">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(question)}
              className="border-slate-300 dark:border-slate-600"
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Answers */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Answers:
        </p>
        {question.answers.map((answer, index) => (
          <div
            key={answer.id}
            className={`flex items-start gap-3 p-3 rounded-lg ${
              answer.isCorrect
                ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                : "bg-slate-50 dark:bg-slate-700/50"
            }`}
          >
            <span className="font-bold text-purple-600 dark:text-purple-400 min-w-[24px]">
              {ANSWER_LABELS[index]}.
            </span>
            <div className="flex-1">
              <span
                className={`${
                  answer.isCorrect
                    ? "text-green-900 dark:text-green-100 font-medium"
                    : "text-slate-700 dark:text-slate-300"
                }`}
              >
                {answer.content}
              </span>
              {answer.explanation && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 italic">
                  {answer.explanation}
                </p>
              )}
            </div>
            {answer.isCorrect && (
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Correct Answer Indicator */}
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Correct Answer{question.isMultipleChoice ? "s" : ""}: <span className="font-bold text-green-600 dark:text-green-400">{correctAnswers}</span>
        </p>
      </div>
    </div>
  );
}
