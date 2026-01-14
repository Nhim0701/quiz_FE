import type { UseFormRegisterReturn, FieldError } from "react-hook-form";
import { FileText, type LucideIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib";

export interface TextareaFieldProps {
  id: string;
  label?: string;
  error?: FieldError;
  required?: boolean;
  disabled?: boolean;
  register: UseFormRegisterReturn;
  placeholder?: string;
  className?: string;
  labelClassName?: string;
  rows?: number;
}

// Icon mapping for textarea fields
const getTextareaIcon = (id: string): { Icon: LucideIcon; color: string } => {
  if (id.includes("description")) {
    return { Icon: FileText, color: "text-purple-500 dark:text-purple-400" };
  }
  // Default
  return { Icon: FileText, color: "text-blue-500 dark:text-blue-400" };
};

export function TextareaField({
  id,
  label,
  error,
  required = false,
  disabled = false,
  register,
  placeholder,
  className,
  labelClassName,
  rows = 4,
  ...props
}: TextareaFieldProps) {
  const hasError = !!error;
  const errorMessage = error?.message;
  const { Icon, color } = getTextareaIcon(id);

  const inputClassName = cn(
    "mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    hasError &&
      "!ring-1 !ring-red-500 dark:!ring-red-600 focus-visible:!ring-red-500 dark:focus-visible:!ring-red-600 !text-red-600 dark:!text-red-400",
    className
  );

  const labelClasses = cn(
    "text-xs text-slate-500 dark:text-slate-400",
    labelClassName
  );

  return (
    <div>
      {label && (
        <Label
          htmlFor={id}
          className={cn(labelClasses, "flex items-center gap-2")}
        >
          <Icon className={cn("h-4 w-4", color)} />
          <span>{label}</span>
          {required && (
            <span className="text-red-500 dark:text-red-400 ml-1">*</span>
          )}
        </Label>
      )}
      <textarea
        {...register}
        id={id}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        className={inputClassName}
        {...(props as any)}
      />
      {hasError && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
