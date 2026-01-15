import { useTestStore } from "../hooks";
import { Card } from "@/components/ui/card";
import { QuestionHeader } from "./test-question-header";
import { AnswerOptions } from "./test-question-options";
import { QuestionExplanation } from "./test-question-explanation";
import { QuestionActions } from "./test-question-actions";
import React from "react";

export function TestQuestion() {
  const {
    questions,
    currentIndex,
    answers,
    flags,
    revealed,
    toggleAnswer,
    toggleFlag,
    toggleRevealed,
    goPrev,
    goNext,
  } = useTestStore();

  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) {
    return null;
  }

  const selectedAnswers = answers[currentQuestion.id] || [];
  const isFlagged = !!flags[currentQuestion.id];
  const isRevealed = !!revealed[currentQuestion.id];

  const hasAnswered = selectedAnswers.length > 0;

  React.useEffect(() => {
    console.log("answers", answers);
    console.log("revealed", revealed);
    console.log("hasAnswered", hasAnswered);
    console.log("selectedAnswers", selectedAnswers);
    console.log("currentQuestion", currentQuestion);
  }, [answers, revealed]);

  const handleToggleAnswer = (answerId: string) => {
    toggleAnswer(currentQuestion.id, answerId);
  };

  const handleToggleFlag = () => {
    toggleFlag(currentQuestion.id);
  };

  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < questions.length - 1;

  return (
    <Card className="p-5 sm:p-8">
      <QuestionHeader
        currentIndex={currentIndex}
        hasMultipleCorrect={currentQuestion.isMultipleChoice}
        isFlagged={isFlagged}
        currentQuestion={currentQuestion}
      />

      <AnswerOptions
        question={currentQuestion}
        selectedAnswers={selectedAnswers}
        isRevealed={isRevealed}
        onToggleAnswer={handleToggleAnswer}
      />

      {isRevealed && <QuestionExplanation question={currentQuestion} />}

      <QuestionActions
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
        isFlagged={isFlagged}
        onGoPrevious={goPrev}
        onGoNext={goNext}
        onToggleFlag={handleToggleFlag}
      />
    </Card>
  );
}
