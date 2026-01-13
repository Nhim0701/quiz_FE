import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import type { FieldError } from "react-hook-form";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib";

export interface DatePickerFieldProps<T extends FieldValues> {
  id: string;
  label: string;
  name: FieldPath<T>;
  control: Control<T>;
  error?: FieldError;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  labelClassName?: string;
}

export function DatePickerField<T extends FieldValues>({
  id,
  label,
  name,
  control,
  error,
  required = false,
  disabled = false,
  placeholder,
  className,
  labelClassName,
}: DatePickerFieldProps<T>) {
  const {
    field: { value, onChange },
  } = useController({
    name,
    control,
  });

  const hasError = !!error;
  const errorMessage = error?.message;

  // Convert string (YYYY-MM-DD) to Date object
  const dateValue =
    value && value.trim() !== ""
      ? (() => {
          const date = new Date(value);
          return isNaN(date.getTime()) ? null : date;
        })()
      : null;

  // Convert Date object back to string (YYYY-MM-DD)
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      onChange(`${year}-${month}-${day}`);
    } else {
      onChange("");
    }
  };

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
      <div className="mt-1">
        <DatePicker
          date={dateValue}
          onSelect={handleDateSelect}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            className,
            hasError &&
              "!ring-1 !ring-red-500 dark:!ring-red-600 focus-visible:!ring-red-500 dark:focus-visible:!ring-red-600 !text-red-600 dark:!text-red-400"
          )}
        />
      </div>
      {hasError && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
