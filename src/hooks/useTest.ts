import { create } from "zustand";
import { QuestionProps, ResponseItem } from "@/types";
import apiClient from "@/lib/axios";
import { API_ENDPOINTS, TIME_CONSTANTS } from "@/constants";

interface TestState {
  // Test configuration
  category: string | null;
  questionSet: string | null;
  testType: string | null;

  // Questions
  questions: QuestionProps[];
  setQuestions: (questions: QuestionProps[]) => void;

  // Test progress
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  goToQuestion: (index: number) => void;
  goNext: () => void;
  goPrev: () => void;

  // Answers
  answers: Record<number, number[]>; // questionId -> array of answer ids
  setAnswers: (answers: Record<number, number[]>) => void;
  toggleAnswer: (questionId: number, answerId: number) => void;
  clearAnswers: () => void;

  // Flags
  flags: Record<number, boolean>; // questionId -> true/false
  toggleFlag: (questionId: number) => void;
  clearFlags: () => void;

  // Revealed questions
  revealed: Record<number, boolean>; // questionId -> true/false
  toggleRevealed: (questionId: number) => void;
  clearRevealed: () => void;

  // Timer
  timeRemaining: number; // in seconds
  setTimeRemaining: (time: number) => void;
  timeStarted: boolean;
  setTimeStarted: (started: boolean) => void;

  // Submission
  submitting: boolean;
  setSubmitting: (submitting: boolean) => void;
  submitBulk: <T>(responses: ResponseItem[]) => Promise<T>;

  // Initialize test
  initializeTest: (
    category: string | null,
    questionSet: string | null,
    testType: string | null,
    questions: QuestionProps[]
  ) => void;

  // Fetch and initialize questions
  fetchAndInitializeTest: (
    category: string,
    questionSet?: string
  ) => Promise<void>;

  // Reset test
  resetTest: () => void;
}

export const useTestStore = create<TestState>((set, get) => ({
  // Initial state
  category: null,
  questionSet: null,
  testType: null,
  questions: [],
  currentIndex: 0,
  answers: {},
  flags: {},
  revealed: {},
  timeRemaining: 0,
  timeStarted: false,
  submitting: false,

  // Questions
  setQuestions: (questions) => set({ questions }),

  // Current index
  setCurrentIndex: (index) => set({ currentIndex: index }),
  goToQuestion: (index) => {
    const { questions } = get();
    set({ currentIndex: Math.max(0, Math.min(questions.length - 1, index)) });
  },
  goNext: () => {
    const { questions, currentIndex } = get();
    set({ currentIndex: Math.min(questions.length - 1, currentIndex + 1) });
  },
  goPrev: () => {
    const { currentIndex } = get();
    set({ currentIndex: Math.max(0, currentIndex - 1) });
  },

  // Answers
  setAnswers: (answers) => set({ answers }),
  toggleAnswer: (questionId, answerId) => {
    const { answers, questions } = get();
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    const existing = answers[questionId] || [];
    const correctAnswersCount = question.answers.filter(
      (a) => a.is_correct
    ).length;
    const hasMultipleCorrect = correctAnswersCount > 1;

    let next: number[];
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
  clearAnswers: () => set({ answers: {} }),

  // Flags
  toggleFlag: (questionId) => {
    const { flags } = get();
    set({
      flags: {
        ...flags,
        [questionId]: !flags[questionId],
      },
    });
  },
  clearFlags: () => set({ flags: {} }),

  // Revealed
  toggleRevealed: (questionId) => {
    const { revealed } = get();
    set({
      revealed: {
        ...revealed,
        [questionId]: !revealed[questionId],
      },
    });
  },
  clearRevealed: () => set({ revealed: {} }),

  // Timer
  setTimeRemaining: (time) => set({ timeRemaining: time }),
  setTimeStarted: (started) => set({ timeStarted: started }),

  // Submission
  setSubmitting: (submitting) => set({ submitting }),
  submitBulk: async <T>(responses: ResponseItem[]): Promise<T> => {
    const response = await apiClient.post(API_ENDPOINTS.RESPONSES.SUBMIT_BULK, {
      responses,
    });
    return response.data;
  },

  // Initialize test
  initializeTest: (category, questionSet, testType, questions) => {
    set({
      category,
      questionSet,
      testType,
      questions,
      currentIndex: 0,
      answers: {},
      flags: {},
      revealed: {},
      timeRemaining: questions.length * TIME_CONSTANTS.SECONDS_PER_QUESTION,
      timeStarted: false,
      submitting: false,
    });
  },

  // Fetch and initialize questions
  fetchAndInitializeTest: async (category, questionSet) => {
    // Dynamic import to avoid circular dependency
    const { useQuestionsStore } = await import("./useQuestions");
    const { getQuestionsByCategory, getQuestionsByCategoryAndSet } =
      useQuestionsStore.getState();
    let questions: QuestionProps[];

    if (questionSet) {
      questions = await getQuestionsByCategoryAndSet<QuestionProps[]>(
        category,
        questionSet
      );
    } else {
      questions = await getQuestionsByCategory<QuestionProps[]>(category);
    }

    const testType = questionSet ? null : category;
    const { initializeTest } = get();
    initializeTest(category, questionSet || null, testType, questions);
  },

  // Reset test
  resetTest: () => {
    set({
      category: null,
      questionSet: null,
      testType: null,
      questions: [],
      currentIndex: 0,
      answers: {},
      flags: {},
      revealed: {},
      timeRemaining: 0,
      timeStarted: false,
      submitting: false,
    });
  },
}));

