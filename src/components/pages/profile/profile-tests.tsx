import { FileText, ArrowRight } from "lucide-react";
import { CategoryWithSetsProps } from "@/types";

interface ProfileTestsProps {
  categoriesWithSets: CategoryWithSetsProps[];
  onStartTest: (category: string, questionSet: string) => void;
}

export function ProfileTests({
  categoriesWithSets,
  onStartTest,
}: ProfileTestsProps) {
  if (!categoriesWithSets || categoriesWithSets.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 sm:mb-6">
          Available Tests
        </h2>
        <div className="text-center py-8 sm:py-12">
          <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mb-2">
            No tests available
          </p>
          <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500">
            Please add questions to the database first
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 sm:mb-6">
        Available Tests
      </h2>

      <div className="space-y-6 sm:space-y-8">
        {categoriesWithSets.map((categoryData) => (
          <div
            key={categoryData.category}
            className="border-b border-slate-200 dark:border-slate-700 last:border-0 pb-6 sm:pb-8 last:pb-0"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 capitalize">
                  {categoryData.category}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {categoryData.total_questions} total questions
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {categoryData.question_sets.map((set) => (
                <button
                  key={set.question_set}
                  onClick={() =>
                    onStartTest(categoryData.category, set.question_set)
                  }
                  className="bg-gradient-to-br from-slate-50 to-slate-100 hover:from-blue-50 hover:to-indigo-50 dark:from-slate-700 dark:to-slate-600 dark:hover:from-blue-900/50 dark:hover:to-indigo-900/50 border-2 border-slate-200 hover:border-blue-400 dark:border-slate-600 dark:hover:border-blue-500 rounded-xl p-4 sm:p-6 text-left transition-all duration-200 hover:shadow-lg group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                      <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="px-2 sm:px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full ml-2">
                      {set.question_count} questions
                    </div>
                  </div>

                  <h4 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 mb-1 truncate">
                    {set.question_set}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">
                    Questions {set.question_range}
                  </p>

                  <div className="mt-3 sm:mt-4 flex items-center text-blue-600 dark:text-blue-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 text-xs sm:text-sm font-semibold">
                    Start Test
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

