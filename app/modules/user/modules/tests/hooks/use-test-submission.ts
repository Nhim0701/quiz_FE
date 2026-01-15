import { create } from "zustand";
import type { ApiSuccessResponse } from "@/types";
import type { SubmissionItem } from "../types";
import type {
  QuestionProps,
  AnswerProps,
} from "@/modules/admin/modules/questions/types";
import { apiClient } from "@/lib";
import { ENDPOINTS } from "../constants";
import { useTestQuestionsStore } from "./use-test-questions";
import { useTestAnswersStore } from "./use-test-answers";
import { useTestTimerStore } from "./use-test-timer";
import { useTestsStore } from "@/modules/admin/modules/tests/hooks";

interface TestSubmissionState {
  submitting: boolean;
  setSubmitting: (submitting: boolean) => void;
  submit: <T>(
    testId: string,
    responses: SubmissionItem[]
  ) => Promise<ApiSuccessResponse<T>>;
  finishTest: (
    navigate: (path: string, options?: { state?: unknown }) => void,
    testId: string,
    onError?: (message: string) => void
  ) => Promise<void>;
}

const buildSubmissions = (
  answers: Record<string, string[]>,
  questions: QuestionProps[]
): SubmissionItem[] => {
  return Object.entries(answers).flatMap(([questionId, selectedAnswerIds]) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return [];

    return selectedAnswerIds
      .map((answerId) => {
        const answer = question.answers.find(
          (a: AnswerProps) => a.id === answerId
        );
        if (!answer) return null;

        return {
          questionId,
          answerId,
          isCorrect: answer.isCorrect,
        };
      })
      .filter((item): item is SubmissionItem => item !== null);
  });
};

const calculateTimeSpent = (
  timeLimit: number,
  timeRemaining: number
): number => {
  const initialTime = timeLimit * 60;
  return initialTime - timeRemaining;
};

export const useTestSubmissionStore = create<TestSubmissionState>((set) => ({
  submitting: false,

  setSubmitting: (submitting) => set({ submitting }),

  submit: async <T>(
    testId: string,
    submissions: SubmissionItem[]
  ): Promise<ApiSuccessResponse<T>> => {
    const response = await apiClient.post<ApiSuccessResponse<T>>(
      ENDPOINTS.SUBMIT(testId),
      { submissions }
    );
    return response.data as ApiSuccessResponse<T>;
  },

  finishTest: async (navigate, testId, onError) => {
    const questionsStore = useTestQuestionsStore.getState();
    const answersStore = useTestAnswersStore.getState();
    const timerStore = useTestTimerStore.getState();
    const { setSubmitting, submit } = useTestSubmissionStore.getState();

    // Stop timer
    timerStore.setTimeStarted(false);

    // Get test to get timeLimit
    const getTestById = useTestsStore.getState().getTestById;
    const test = await getTestById(testId);

    if (!test) {
      onError?.("Test not found");
      return;
    }

    const { questions } = questionsStore;
    const { answers } = answersStore;
    const { timeRemaining } = timerStore;

    const submissions = buildSubmissions(answers, questions);
    const timeSpent = calculateTimeSpent(test.timeLimit, timeRemaining);

    // Submit responses to backend
    if (submissions.length > 0) {
      setSubmitting(true);
      try {
        await submit<void>(testId, submissions);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to submit responses";
        onError?.(errorMessage);
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
          total: questions.length,
          answered: Object.keys(answers).length,
          date: new Date().toISOString(),
          timeSpent,
          timeRemaining,
        },
      },
    });
  },
}));
