import { create } from "zustand";
import type { ApiSuccessResponse, PaginationMeta } from "@/types";
import type { QuestionProps } from "../../../../../hooks/useQuestions";
import type { SubmissionItem } from "@/types";
import apiClient from "@/lib/axios";
import { API_ENDPOINTS, TIME_CONSTANTS } from "@/constants";

interface TestState {
  // Questions
  questions: QuestionProps[];

  // Test progress
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  goToQuestion: (index: number) => void;
  goNext: () => void;
  goPrev: () => void;

  // Answers
  answers: Record<string, string[]>; // questionId -> array of answer ids
  toggleAnswer: (questionId: string, answerId: string) => void;

  // Flags
  flags: Record<string, boolean>; // questionId -> true/false
  toggleFlag: (questionId: string) => void;

  // Revealed questions
  revealed: Record<string, boolean>; // questionId -> true/false
  toggleRevealed: (questionId: string) => void;

  // Timer
  timeRemaining: number; // in seconds
  setTimeRemaining: (time: number) => void;
  timeStarted: boolean;
  setTimeStarted: (started: boolean) => void;

  // Submission
  submitting: boolean;
  setSubmitting: (submitting: boolean) => void;
  submitBulk: <T>(
    responses: SubmissionItem[]
  ) => Promise<ApiSuccessResponse<T>>;
  finishTest: (
    navigate: (path: string, options?: { state?: unknown }) => void,
    testId: string,
    onError?: (message: string) => void
  ) => Promise<void>;

  // Loading
  loading: boolean;
  setLoading: (loading: boolean) => void;

  // Initialize test
  initializeTest: (testId: string, questions: QuestionProps[]) => void;

  // Fetch and initialize questions
  fetchAndInitializeTest: (
    testId: string,
    setLoading?: (loading: boolean) => void,
    onError?: (message: string) => void
  ) => Promise<void>;

  // Timer management
  startTimer: () => void;
}

export const useTestStore = create<TestState>((set, get) => ({
  // Initial state
  questions: [],
  currentIndex: 0,
  answers: {},
  flags: {},
  revealed: {},
  timeRemaining: 0,
  timeStarted: false,
  submitting: false,
  loading: false,

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
  toggleAnswer: (questionId, answerId) => {
    const { answers, questions } = get();
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    const existing = answers[questionId] || [];
    const correctAnswersCount = question.answers.filter(
      (a) => a.is_correct
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

  // Timer
  setTimeRemaining: (time) => set({ timeRemaining: time }),
  setTimeStarted: (started) => set({ timeStarted: started }),

  // Submission
  setSubmitting: (submitting) => set({ submitting }),
  submitBulk: async <T>(
    submissions: SubmissionItem[]
  ): Promise<ApiSuccessResponse<T>> => {
    const response = await apiClient.post<ApiSuccessResponse<T>>(
      API_ENDPOINTS.RESPONSES.SUBMIT_BULK,
      {
        submissions,
      }
    );
    return response.data;
  },
  finishTest: async (navigate, testId, onError) => {
    const {
      questions,
      answers,
      timeRemaining,
      timeStarted,
      setTimeStarted,
      setSubmitting,
      submitBulk,
    } = get();

    // Stop timer
    setTimeStarted(false);

    const total = questions.length;
    const answered = Object.keys(answers).length;
    const initialTime = questions.length * TIME_CONSTANTS.SECONDS_PER_QUESTION;
    const timeSpent = initialTime - timeRemaining;

    // Build responses array for backend submission
    const submissions: SubmissionItem[] = [];
    for (const [questionId, selectedAnswerIds] of Object.entries(answers)) {
      const question = questions.find((q) => q.id === questionId);
      if (!question) continue;

      for (const answerId of selectedAnswerIds) {
        const answer = question.answers.find((a) => a.id === answerId);
        if (!answer) continue;

        submissions.push({
          question_id: questionId,
          selected_option_id: answerId,
          is_correct: answer.is_correct,
        });
      }
    }

    // Submit responses to backend
    if (submissions.length > 0) {
      setSubmitting(true);
      try {
        await submitBulk<void>(submissions);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to submit responses";
        if (onError) onError(errorMessage);
        // Continue to result page even if submission fails
      } finally {
        setSubmitting(false);
      }
    }

    navigate(`/tests/${testId}/result`, {
      state: {
        answers,
        questions,
        summary: {
          total,
          answered,
          date: new Date().toISOString(),
          timeSpent,
          timeRemaining,
        },
      },
    });
  },

  // Loading
  setLoading: (loading) => set({ loading }),

  // Initialize test
  initializeTest: (testId, questions) => {
    set({
      questions,
      currentIndex: 0,
      answers: {},
      flags: {},
      revealed: {},
      timeRemaining: questions.length * TIME_CONSTANTS.SECONDS_PER_QUESTION,
      timeStarted: false,
      submitting: false,
      loading: false,
    });
  },

  // Fetch and initialize questions from test (with pagination support)
  fetchAndInitializeTest: async (testId: string, setLoading, onError) => {
    if (setLoading) setLoading(true);
    set({ loading: true });

    try {
      const allQuestions: QuestionProps[] = [];

      // Fetch first page to get pagination info
      const firstResponse = await apiClient.get<
        ApiSuccessResponse<QuestionProps[]>
      >(API_ENDPOINTS.TESTS.QUESTIONS(testId), {
        params: {
          page: 1,
          page_size: 100,
        },
      });

      const firstPageData = firstResponse.data.data || [];
      allQuestions.push(...firstPageData);

      // Check if there's pagination meta and fetch remaining pages
      const meta = firstResponse.data.meta;
      let totalPages = 1;
      if (meta && typeof meta === "object" && "total_pages" in meta) {
        const paginationMeta = meta as PaginationMeta;
        totalPages = paginationMeta.total_pages;
      }

      // Fetch remaining pages if any
      if (totalPages > 1) {
        const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) =>
          apiClient.get<ApiSuccessResponse<QuestionProps[]>>(
            `${API_ENDPOINTS.TESTS.QUESTIONS(testId)}`,
            { params: { page: i + 2, page_size: 100 } }
          )
        );

        const remainingResponses = await Promise.all(remainingPages);
        remainingResponses.forEach((response) => {
          const pageData = response.data.data || [];
          allQuestions.push(...pageData);
        });
      }

      const { initializeTest } = get();
      initializeTest(testId, allQuestions);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch questions";
      if (onError) onError(errorMessage);
      throw error;
    } finally {
      if (setLoading) setLoading(false);
      set({ loading: false });
    }
  },

  // Timer management
  startTimer: () => {
    const { questions, loading, timeStarted } = get();
    if (!loading && questions.length > 0 && !timeStarted) {
      set({ timeStarted: true });
    }
  },
}));
