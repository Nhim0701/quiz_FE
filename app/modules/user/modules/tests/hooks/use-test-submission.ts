import { create } from "zustand";
import type { ApiSuccessResponse } from "@/types";
import type { SubmissionItem } from "../types";
import { apiClient } from "@/lib";
import { ENDPOINTS } from "../constants";
import { useTestQuestionsStore } from "./use-test-questions";
import { useTestAnswersStore } from "./use-test-answers";
import { useTestTimerStore } from "./use-test-timer";
import { useTestsStore } from "@/modules/admin/modules/tests/hooks";

interface TestSubmissionState {
  // Submission
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

export const useTestSubmissionStore = create<TestSubmissionState>(
  (set, get) => ({
    // Initial state
    submitting: false,

    // Submission
    setSubmitting: (submitting) => set({ submitting }),

    submit: async <T>(
      testId: string,
      submissions: SubmissionItem[]
    ): Promise<ApiSuccessResponse<T>> => {
      const response = await apiClient.post<ApiSuccessResponse<T>>(
        ENDPOINTS.SUBMIT(testId),
        {
          submissions,
        }
      );
      return response.data;
    },

    finishTest: async (navigate, testId, onError) => {
      const { questions } = useTestQuestionsStore.getState();
      const { answers } = useTestAnswersStore.getState();
      const { timeRemaining, timeStarted, setTimeStarted } =
        useTestTimerStore.getState();
      const { setSubmitting, submit } = get();

      // Stop timer
      setTimeStarted(false);

      // Get test to get timeLimit
      const getTestById = useTestsStore.getState().getTestById;
      const test = await getTestById(testId);

      if (!test) {
        if (onError) onError("Test not found");
        return;
      }

      const total = questions.length;
      const answered = Object.keys(answers).length;
      // Convert timeLimit from minutes to seconds
      const initialTime = test.timeLimit * 60;
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
            questionId: questionId,
            answerId: answerId,
            isCorrect: answer.isCorrect,
          });
        }
      }

      // Submit responses to backend
      if (submissions.length > 0) {
        setSubmitting(true);
        try {
          await submit<void>(testId, submissions);
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to submit responses";
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
  })
);
