import { useMemo } from "react";
import { useTranslation } from "@/i18n";
import { type Category } from "@/modules/admin/categories/hooks";
import { useTestsStore } from "@/hooks/use-tests";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { TestCard } from "./test-card";

interface TestCategoryItemProps {
  category: Category;
}

const EMPTY_ARRAY: never[] = [];

export function TestCategoryItem({ category }: TestCategoryItemProps) {
  const { t } = useTranslation();

  const testsRaw = useTestsStore((state) => state.testsByCategory[category.id]);

  const tests = useMemo(() => testsRaw || EMPTY_ARRAY, [testsRaw]);

  const totalQuestions = useMemo(() => {
    return tests.reduce((sum, test) => sum + (test.questionCount || 0), 0);
  }, [tests]);

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
        {tests.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {tests.map((test) => (
              <TestCard key={test.id} test={test} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <p>{t("tests.noTests")}</p>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
