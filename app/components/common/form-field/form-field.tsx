import type { UseFormRegisterReturn, FieldError } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface FormFieldProps {
  id: string;
  label: string;
  error?: FieldError;
  required?: boolean;
  disabled?: boolean;
  register: UseFormRegisterReturn;
  type?: "text" | "email" | "password" | "number" | "tel";
  placeholder?: string;
  className?: string;
  labelClassName?: string;
  min?: string | number;
}

export function FormField({
  id,
  label,
  error,
  required = false,
  disabled = false,
  register,
  type = "text",
  placeholder,
  className,
  labelClassName,
  min,
  ...props
}: FormFieldProps) {
  const hasError = !!error;
  const errorMessage = error?.message;

  const inputClassName = cn(
    className,
    hasError &&
      "!ring-1 !ring-red-500 dark:!ring-red-600 focus-visible:!ring-red-500 dark:focus-visible:!ring-red-600 !text-red-600 dark:!text-red-400"
  );

  const labelClasses = cn(
    "text-xs text-slate-500 dark:text-slate-400",
    labelClassName
  );

  return (
    <div>
      <Label htmlFor={id} className={labelClasses}>
        {label}
        {required && (
          <span className="text-red-500 dark:text-red-400 ml-1">*</span>
        )}
      </Label>
      <Input
        {...register}
        id={id}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        className={cn("mt-1", inputClassName)}
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
