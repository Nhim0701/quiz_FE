import { create } from "zustand";
import type { QuestionProps } from "./useQuestions";

interface ResultSummary {
  total: number;
  answered: number;
  testType?: string;
  date: string;
  timeSpent: number;
  timeRemaining: number;
}

interface ResultState {
  // Result data
  summary: ResultSummary | null;
  answers: Record<string, string[]>; // questionId -> array of answer ids
  questions: QuestionProps[];

  // Set result data
  setResult: (
    summary: ResultSummary,
    answers: Record<string, string[]>,
    questions: QuestionProps[]
  ) => void;

  // Calculate stats
  getCorrectCount: () => number;
  getWrongCount: () => number;
  getAccuracyPercentage: () => number;
}

export const useResultStore = create<ResultState>((set, get) => ({
  // Initial state
  summary: null,
  answers: {},
  questions: [],

  // Set result
  setResult: (summary, answers, questions) =>
    set({ summary, answers, questions }),

  // Calculate correct count
  getCorrectCount: () => {
    const { questions, answers } = get();
    return questions.reduce((count, question) => {
      const userAnswerIds = answers[question.id] || [];
      if (userAnswerIds.length === 0) return count;

      const correctAnswerIds = question.answers
        .filter((a) => a.isCorrect)
        .map((a) => a.id);

      // Check if user selected all correct answers and no incorrect ones
      const isCorrect =
        correctAnswerIds.length === userAnswerIds.length &&
        correctAnswerIds.every((id) => userAnswerIds.includes(id));

      return isCorrect ? count + 1 : count;
    }, 0);
  },

  // Calculate wrong count
  getWrongCount: () => {
    const { summary, getCorrectCount } = get();
    if (!summary) return 0;
    return summary.answered - getCorrectCount();
  },

  // Calculate accuracy percentage
  getAccuracyPercentage: () => {
    const { summary, getCorrectCount } = get();
    if (!summary || summary.answered === 0) return 0;
    return Math.round((getCorrectCount() / summary.answered) * 100);
  },
}));
