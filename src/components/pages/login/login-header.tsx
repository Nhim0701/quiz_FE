import { FileText } from "lucide-react";

export function LoginHeader() {
  return (
    <div className="text-center mb-6 sm:mb-8">
      <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 rounded-full mb-3 sm:mb-4 shadow-lg">
        <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
        Welcome Back
      </h1>
      <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
        Sign in to continue your quiz journey
      </p>
    </div>
  );
}

