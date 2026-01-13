import { useState } from "react";
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import type { FieldError } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib";

export interface ComboboxOption {
  value: string;
  label: string;
}

export interface ComboboxFieldProps<T extends FieldValues> {
  id: string;
  label: string;
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

export function ComboboxField<T extends FieldValues>({
  id,
  label,
  name,
  control,
  options,
  error,
  required = false,
  disabled = false,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No option found.",
  className,
  labelClassName,
}: ComboboxFieldProps<T>) {
  const {
    field: { value, onChange },
  } = useController({
    name,
    control,
  });

  const [open, setOpen] = useState(false);

  const hasError = !!error;
  const errorMessage = error?.message;

  const selectedOption = options.find((option) => option.value === value);
  const displayValue = selectedOption?.label || placeholder;

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
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "mt-2 w-full justify-between",
              !value && "text-muted-foreground",
              hasError &&
                "border-red-500 dark:border-red-600 focus-visible:ring-red-500 dark:focus-visible:ring-red-600",
              className
            )}
            disabled={disabled}
            type="button"
          >
            <span className="truncate flex-1 text-left">{displayValue}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => {
                      onChange(option.value === value ? "" : option.value);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {hasError && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
