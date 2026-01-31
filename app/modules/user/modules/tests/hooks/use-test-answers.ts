import { create } from "zustand";
import { useTestQuestionsStore } from "./use-test-questions";

interface TestAnswersState {
  answers: Record<string, string[]>; // questionId -> array of answer ids
  toggleAnswer: (questionId: string, answerId: string) => void;
  setAnswers: (answers: Record<string, string[]>) => void;
  resetAnswers: () => void;
}

export const useTestAnswersStore = create<TestAnswersState>((set, get) => ({
  answers: {},

  toggleAnswer: (questionId, answerId) => {
    const { questions } = useTestQuestionsStore.getState();
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    const existing = get().answers[questionId] || [];
    const isSelected = existing.includes(answerId);
    if (isSelected) {
      set((state) => ({
        answers: {
          ...state.answers,
          [questionId]: existing.filter((id) => id !== answerId),
        },
      }));
      return;
    }
    const next = question.isMultipleChoice
      ? [...existing, answerId] // Multiple choice: add to selection
      : [answerId]; // Single choice: replace selection

    set((state) => ({
      answers: {
        ...state.answers,
        [questionId]: next,
      },
    }));
  },

  setAnswers: (answers) => set({ answers }),
  resetAnswers: () => set({ answers: {} }),
}));
