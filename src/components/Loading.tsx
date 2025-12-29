import useApp from "../hooks/useApp";

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

export default function Loading({
  message = "Loading...",
  fullScreen = true,
  className = "",
}: LoadingProps) {
  const { loading } = useApp();

  if (!loading) return null;

  const containerClasses = fullScreen
    ? "min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800"
    : "flex items-center justify-center p-4";

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mb-4"></div>
        <p className="text-slate-600 dark:text-slate-400">{message}</p>
      </div>
    </div>
  );
}
