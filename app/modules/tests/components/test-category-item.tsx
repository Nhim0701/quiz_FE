import { useMemo } from "react";
import { useTranslation } from "@/i18n";
import { useCategoriesStore } from "@/hooks/useCategories";
import { useQuestionSetsStore } from "@/hooks/useQuestionSets";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { TestQuestionSetCard } from "./test-question-set-card";

interface TestCategoryItemProps {
  categoryId: number;
}

export function TestCategoryItem({ categoryId }: TestCategoryItemProps) {
  const { t } = useTranslation();
  const { categories } = useCategoriesStore();
  const { questionSetsByCategory } = useQuestionSetsStore();

  const category = useMemo(
    () => categories.find((cat) => cat.id === categoryId),
    [categories, categoryId]
  );

  console.log(category);
  console.log(questionSetsByCategory);

  const questionSets = useMemo(
    () => questionSetsByCategory[categoryId] || [],
    [questionSetsByCategory, categoryId]
  );

  const totalQuestions = useMemo(() => {
    return questionSets.reduce(
      (sum, set) => sum + (set.question_count || 0),
      0
    );
  }, [questionSets]);

  if (!category) {
    return null;
  }

  return (
    <AccordionItem key={category.id} value={category.name}>
      <AccordionTrigger className="hover:no-underline py-4 sm:py-6">
        <div className="flex items-center justify-between w-full pr-4">
          <div className="text-left">
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 capitalize">
              {category.name}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {totalQuestions} {t("tests.totalQuestions")}
            </p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-4 sm:pt-6">
        {questionSets && questionSets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {questionSets.map((set) => (
              <TestQuestionSetCard key={set.id} set={set} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <p>{t("tests.noQuestionSets")}</p>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
