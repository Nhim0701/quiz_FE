import { useTheme } from "@/hooks/useApp";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-950 group-[.toaster]:border-slate-200 group-[.toaster]:shadow-lg dark:group-[.toaster]:bg-slate-950 dark:group-[.toaster]:text-slate-50 dark:group-[.toaster]:border-slate-800",
          description:
            "group-[.toast]:text-slate-500 dark:group-[.toast]:text-slate-400",
          actionButton:
            "group-[.toast]:bg-slate-900 group-[.toast]:text-slate-50 dark:group-[.toast]:bg-slate-50 dark:group-[.toast]:text-slate-900",
          cancelButton:
            "group-[.toast]:bg-slate-100 group-[.toast]:text-slate-500 dark:group-[.toast]:bg-slate-800 dark:group-[.toast]:text-slate-400",
          closeButton:
            "group-[.toast]:bg-slate-100/50 group-[.toast]:text-slate-500 hover:group-[.toast]:bg-slate-200 dark:group-[.toast]:bg-slate-800/50 dark:group-[.toast]:text-slate-400 dark:hover:group-[.toast]:bg-slate-700",
          error:
            "group-[.toaster]:bg-red-50 group-[.toaster]:text-red-900 group-[.toaster]:border-red-300 group-[.toaster]:border-l-4 dark:group-[.toaster]:bg-red-950/50 dark:group-[.toaster]:text-red-100 dark:group-[.toaster]:border-red-800",
          success:
            "group-[.toaster]:bg-green-50 group-[.toaster]:text-green-900 group-[.toaster]:border-green-300 group-[.toaster]:border-l-4 dark:group-[.toaster]:bg-green-950/50 dark:group-[.toaster]:text-green-100 dark:group-[.toaster]:border-green-800",
          info: "group-[.toaster]:bg-blue-50 group-[.toaster]:text-blue-900 group-[.toaster]:border-blue-300 group-[.toaster]:border-l-4 dark:group-[.toaster]:bg-blue-950/50 dark:group-[.toaster]:text-blue-100 dark:group-[.toaster]:border-blue-800",
          warning:
            "group-[.toaster]:bg-amber-50 group-[.toaster]:text-amber-900 group-[.toaster]:border-amber-300 group-[.toaster]:border-l-4 dark:group-[.toaster]:bg-amber-950/50 dark:group-[.toaster]:text-amber-100 dark:group-[.toaster]:border-amber-800",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

