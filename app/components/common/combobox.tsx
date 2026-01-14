import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useTranslation } from "@/i18n";
import { cn } from "@/lib";
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
import { ScrollArea } from "@/components/ui/scroll-area";

export interface ComboboxOption {
  value: string;
  label: string;
}

export interface BaseComboboxProps {
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
  popoverClassName?: string;
  useScrollArea?: boolean;
}

interface SingleSelectComboboxProps extends BaseComboboxProps {
  mode: "single";
  value: string;
  onSelect: (value: string) => void;
}

interface MultipleSelectComboboxProps extends BaseComboboxProps {
  mode: "multiple";
  value: string[];
  onSelect: (values: string[]) => void;
  children?: React.ReactNode;
}

export type ComboboxProps =
  | SingleSelectComboboxProps
  | MultipleSelectComboboxProps;

/**
 * Base Combobox component that supports both single and multiple selection modes
 */
export function Combobox(props: ComboboxProps) {
  const {
    options,
    placeholder,
    searchPlaceholder,
    emptyMessage,
    className,
    disabled = false,
    popoverClassName,
    useScrollArea = false,
  } = props;

  const [open, setOpen] = React.useState(false);
  const { t } = useTranslation();

  const defaultPlaceholder = placeholder ?? t("common.selectPlaceholder");
  const defaultSearchPlaceholder =
    searchPlaceholder ?? t("common.comboboxSearchPlaceholder");
  const defaultEmptyMessage = emptyMessage ?? t("common.noResultsFound");

  const handleSingleSelect = (optionValue: string) => {
    if (props.mode === "single") {
      const newValue = optionValue === props.value ? "" : optionValue;
      props.onSelect(newValue);
      setOpen(false);
    }
  };

  const handleMultipleSelect = (optionValue: string) => {
    if (props.mode === "multiple") {
      const newValues = props.value.includes(optionValue)
        ? props.value.filter((v) => v !== optionValue)
        : [...props.value, optionValue];
      props.onSelect(newValues);
    }
  };

  const handleSelect = (optionValue: string) => {
    if (props.mode === "single") {
      handleSingleSelect(optionValue);
    } else {
      handleMultipleSelect(optionValue);
    }
  };

  const isSelected = (optionValue: string): boolean => {
    if (props.mode === "single") {
      return props.value === optionValue;
    }
    return props.value.includes(optionValue);
  };

  const displayValue = React.useMemo(() => {
    if (props.mode === "single") {
      const selectedOption = options.find((opt) => opt.value === props.value);
      return selectedOption?.label ?? defaultPlaceholder;
    }
    return null; // Multiple mode handles display differently
  }, [
    props.mode,
    props.mode === "single"
      ? (props as SingleSelectComboboxProps).value
      : undefined,
    options,
    defaultPlaceholder,
  ]);

  const hasValue = React.useMemo(() => {
    if (props.mode === "single") {
      return !!(props as SingleSelectComboboxProps).value;
    }
    return (props as MultipleSelectComboboxProps).value.length > 0;
  }, [
    props.mode,
    props.mode === "single"
      ? (props as SingleSelectComboboxProps).value
      : (props as MultipleSelectComboboxProps).value.length,
  ]);

  const commandContent = (
    <Command className={useScrollArea ? "overflow-hidden" : ""}>
      <CommandInput placeholder={defaultSearchPlaceholder} />
      {useScrollArea ? (
        <ScrollArea>
          <CommandList>
            <CommandEmpty className="p-4 text-center overflow-ellipsis">
              {defaultEmptyMessage}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
                  keywords={[option.label]}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      isSelected(option.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </ScrollArea>
      ) : (
        <CommandList>
          <CommandEmpty className="p-4 text-center overflow-ellipsis">
            {defaultEmptyMessage}
          </CommandEmpty>
          <CommandGroup>
            {options.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={() => handleSelect(option.value)}
                keywords={[option.label]}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    isSelected(option.value) ? "opacity-100" : "opacity-0"
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      )}
    </Command>
  );

  return (
    <Popover open={open} onOpenChange={setOpen} modal={props.mode === "single"}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            !hasValue && "text-muted-foreground",
            className
          )}
          disabled={disabled}
          type="button"
        >
          {props.mode === "single" ? (
            <span className="truncate flex-1 text-left">{displayValue}</span>
          ) : (
            props.children
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          props.mode === "single"
            ? "w-[var(--radix-popover-trigger-width)] p-0"
            : "w-full p-0",
          popoverClassName
        )}
        align="start"
        sideOffset={props.mode === "single" ? 4 : 0}
      >
        {commandContent}
      </PopoverContent>
    </Popover>
  );
}
