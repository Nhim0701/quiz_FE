import { create } from "zustand";
import type { QuestionProps } from "@/modules/admin/modules/questions/types";
import { isQuestionAnsweredCorrectly } from "../utils";

interface ResultSummary {
  total: number;
  answered: number;
  testType?: string;
  date: string;
  timeSpent: number;
  timeRemaining: number;
}

interface ResultState {
  summary: ResultSummary | null;
  answers: Record<string, string[]>;
  questions: QuestionProps[];
  flags: Record<string, boolean>;
  setResult: (
    summary: ResultSummary,
    answers: Record<string, string[]>,
    questions: QuestionProps[],
    flags?: Record<string, boolean>
  ) => void;
  clearResult: () => void;
  getCorrectCount: () => number;
  getWrongCount: () => number;
  getAccuracyPercentage: () => number;
}

export const useResultStore = create<ResultState>((set, get) => ({
  summary: null,
  answers: {},
  questions: [],
  flags: {},
  setResult: (summary, answers, questions, flags = {}) =>
    set({ summary, answers, questions, flags }),
  clearResult: () => set({ summary: null, answers: {}, questions: [], flags: {} }),
  getCorrectCount: () => {
    const { questions, answers } = get();
    return questions.filter((q) =>
      isQuestionAnsweredCorrectly(q, answers[q.id] || [])
    ).length;
  },
  getWrongCount: () => {
    const { summary, getCorrectCount } = get();
    if (!summary) return 0;
    return summary.answered - getCorrectCount();
  },
  getAccuracyPercentage: () => {
    const { summary, getCorrectCount } = get();
    if (!summary || summary.answered === 0) return 0;
    return Math.round((getCorrectCount() / summary.answered) * 100);
  },
}));
