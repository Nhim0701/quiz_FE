import type {
  QuestionProps,
  AnswerProps,
} from "@/modules/admin/modules/questions/types";

export function toggleRecordKey(
  record: Record<string, boolean>,
  key: string
): Record<string, boolean> {
  return { ...record, [key]: !record[key] };
}

export function isQuestionAnsweredCorrectly(
  question: QuestionProps,
  userAnswerIds: string[]
): boolean {
  if (userAnswerIds.length === 0) return false;
  const correctAnswerIds = question.answers
    .filter((a: AnswerProps) => a.isCorrect)
    .map((a: AnswerProps) => a.id);
  return (
    correctAnswerIds.length === userAnswerIds.length &&
    correctAnswerIds.every((id: string) => userAnswerIds.includes(id))
  );
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function shuffleQuestions(questions: QuestionProps[]): QuestionProps[] {
  return shuffleArray(questions);
}

export function shuffleAnswers(questions: QuestionProps[]): QuestionProps[] {
  return questions.map((question) => ({
    ...question,
    answers: shuffleArray(question.answers),
  }));
}

export function shuffleQuestionsAndAnswers(
  questions: QuestionProps[]
): QuestionProps[] {
  const shuffledQuestions = shuffleQuestions(questions);
  return shuffleAnswers(shuffledQuestions);
}
