import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import type { FieldError } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Folder, type LucideIcon } from "lucide-react";
import { cn } from "@/lib";
import { Combobox, type ComboboxOption } from "@/components/common/combobox";

export type { ComboboxOption };

export interface ComboboxFieldProps<T extends FieldValues> {
  id: string;
  label?: string;
  name: FieldPath<T>;
  control: Control<T>;
  options: ComboboxOption[];
  error?: FieldError;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  labelClassName?: string;
}

// Icon mapping for combobox fields
const getComboboxIcon = (id: string): { Icon: LucideIcon; color: string } => {
  if (id.includes("category")) {
    return { Icon: Folder, color: "text-green-500 dark:text-green-400" };
  }
  // Default
  return { Icon: Folder, color: "text-blue-500 dark:text-blue-400" };
};

export function ComboboxField<T extends FieldValues>({
  id,
  label,
  name,
  control,
  options,
  error,
  required = false,
  disabled = false,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  className,
  labelClassName,
}: ComboboxFieldProps<T>) {
  const {
    field: { value, onChange },
  } = useController({
    name,
    control,
  });

  const hasError = !!error;
  const errorMessage = error?.message;

  const labelClasses = cn(
    "text-xs text-slate-500 dark:text-slate-400",
    labelClassName
  );
  const { Icon, color } = getComboboxIcon(id);

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
      <Combobox
        mode="single"
        options={options}
        value={value}
        onSelect={onChange}
        placeholder={placeholder}
        searchPlaceholder={searchPlaceholder}
        emptyMessage={emptyMessage}
        disabled={disabled}
        useScrollArea={true}
        className={cn(
          "mt-2",
          hasError &&
            "border-red-500 dark:border-red-600 focus-visible:ring-red-500 dark:focus-visible:ring-red-600",
          className
        )}
      />
      {hasError && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
