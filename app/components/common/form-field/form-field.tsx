import { useMemo } from "react";
import type { UseFormRegisterReturn, FieldError } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib";
import {
  FIELD_ICON_MAP,
  FORM_FIELD_ERROR_CLASSES,
  FORM_FIELD_LABEL_CLASSES,
  FORM_FIELD_INPUT_CLASSES,
  type IconConfig,
} from "@/constants/form-fields";

export interface FormFieldProps {
  id: string;
  label?: string;
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

/**
 * Get icon configuration for a form field based on id and type
 */
const getFieldIcon = (
  id: string,
  type?: "text" | "email" | "password" | "number" | "tel"
): IconConfig => {
  const matchedConfig = FIELD_ICON_MAP.find(({ match }) => match(id, type));
  return (
    matchedConfig?.config ?? FIELD_ICON_MAP[FIELD_ICON_MAP.length - 1].config
  );
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

  const iconConfig = useMemo(() => getFieldIcon(id, type), [id, type]);
  const { Icon, color } = iconConfig;

  const inputClassName = useMemo(
    () =>
      cn(
        FORM_FIELD_INPUT_CLASSES.BASE,
        className,
        hasError && FORM_FIELD_ERROR_CLASSES.INPUT
      ),
    [className, hasError]
  );

  const labelClasses = useMemo(
    () =>
      cn(
        FORM_FIELD_LABEL_CLASSES.BASE,
        FORM_FIELD_LABEL_CLASSES.CONTAINER,
        labelClassName
      ),
    [labelClassName]
  );

  return (
    <div>
      {label && (
        <Label htmlFor={id} className={labelClasses}>
          <Icon className={cn("h-4 w-4", color)} />
          <span>{label}</span>
          {required && (
            <span className={FORM_FIELD_ERROR_CLASSES.REQUIRED_MARKER}>*</span>
          )}
        </Label>
      )}
      <Input
        {...register}
        id={id}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        className={inputClassName}
        {...(props as any)}
      />
      {hasError && (
        <p className={FORM_FIELD_ERROR_CLASSES.TEXT}>{errorMessage}</p>
      )}
    </div>
  );
}
