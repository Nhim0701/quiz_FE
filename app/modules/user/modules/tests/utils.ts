import type { QuestionProps } from "@/modules/admin/modules/questions/types";

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
