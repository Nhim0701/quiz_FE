import { create } from "zustand";
import { useTestQuestionsStore } from "./use-test-questions";

interface TestAnswersState {
  // Answers
  answers: Record<string, string[]>; // questionId -> array of answer ids
  toggleAnswer: (questionId: string, answerId: string) => void;
  resetAnswers: () => void;
}

export const useTestAnswersStore = create<TestAnswersState>((set, get) => ({
  // Initial state
  answers: {},

  // Answers
  toggleAnswer: (questionId, answerId) => {
    const { answers } = get();
    const { questions } = useTestQuestionsStore.getState();
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    const existing = answers[questionId] || [];
    const correctAnswersCount = question.answers.filter(
      (a) => a.isCorrect
    ).length;
    const hasMultipleCorrect = correctAnswersCount > 1;

    let next: string[];
    if (existing.includes(answerId)) {
      // Always allow deselecting
      next = existing.filter((id) => id !== answerId);
    } else {
      if (hasMultipleCorrect) {
        // Multiple correct answers: allow selecting multiple
        next = [...existing, answerId];
      } else {
        // Single correct answer: replace previous selection
        next = [answerId];
      }
    }

    set({
      answers: {
        ...answers,
        [questionId]: next,
      },
    });
  },

  resetAnswers: () => set({ answers: {} }),
}));
