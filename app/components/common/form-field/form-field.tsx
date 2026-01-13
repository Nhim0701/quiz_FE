import type { UseFormRegisterReturn, FieldError } from "react-hook-form";
import {
  User,
  Mail,
  Lock,
  Phone,
  Hash,
  FileText,
  Key,
  Tag,
  Folder,
  Calendar,
  type LucideIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib";

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

// Icon mapping based on field id and type
const getFieldIcon = (
  id: string,
  type?: "text" | "email" | "password" | "number" | "tel"
): { Icon: LucideIcon; color: string } => {
  // Type-based icons
  if (type === "email") {
    return { Icon: Mail, color: "text-blue-500 dark:text-blue-400" };
  }
  if (type === "password") {
    return { Icon: Lock, color: "text-blue-500 dark:text-blue-400" };
  }
  if (type === "tel" || id.includes("phone")) {
    return { Icon: Phone, color: "text-blue-500 dark:text-blue-400" };
  }
  if (type === "number" || id.includes("number")) {
    return { Icon: Hash, color: "text-blue-500 dark:text-blue-400" };
  }

  // ID-based icons
  if (id.includes("name") && !id.includes("namespace")) {
    return { Icon: User, color: "text-emerald-500 dark:text-emerald-400" };
  }
  if (id.includes("permission") || id.includes("key")) {
    return { Icon: Key, color: "text-purple-500 dark:text-purple-400" };
  }
  if (id.includes("description")) {
    return { Icon: FileText, color: "text-purple-500 dark:text-purple-400" };
  }
  if (id.includes("category")) {
    return { Icon: Folder, color: "text-green-500 dark:text-green-400" };
  }
  if (id.includes("tag") || id.includes("prefix")) {
    return { Icon: Tag, color: "text-blue-500 dark:text-blue-400" };
  }
  if (id.includes("date") || id.includes("birthday")) {
    return { Icon: Calendar, color: "text-blue-500 dark:text-blue-400" };
  }

  // Default
  return { Icon: FileText, color: "text-blue-500 dark:text-blue-400" };
};

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
  const { Icon, color } = getFieldIcon(id, type);

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
