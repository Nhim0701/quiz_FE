import { Edit, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Question } from "@/types/content";

interface QuestionCardProps {
  question: Question;
  onDelete: (questionId: string) => void;
  onEdit?: (question: Question) => void;
}

export function QuestionCard({ question, onDelete, onEdit }: QuestionCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">
              {question.categoryName}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ID: {question.questionId}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {question.questionText}
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(question.questionId)}
            className="border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Answers */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Answers:
        </p>
        {question.answers.map((answer) => (
          <div
            key={answer.id}
            className={`flex items-start gap-3 p-3 rounded-lg ${
              answer.isCorrect
                ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                : "bg-slate-50 dark:bg-slate-700/50"
            }`}
          >
            <span className="font-bold text-purple-600 dark:text-purple-400 min-w-[24px]">
              {answer.label}.
            </span>
            <span
              className={`flex-1 ${
                answer.isCorrect
                  ? "text-green-900 dark:text-green-100 font-medium"
                  : "text-slate-700 dark:text-slate-300"
              }`}
            >
              {answer.text}
            </span>
            {answer.isCorrect && (
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Correct Answer Indicator */}
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Correct Answer: <span className="font-bold text-green-600 dark:text-green-400">{question.correctAnswer}</span>
        </p>
      </div>
    </div>
  );
}
