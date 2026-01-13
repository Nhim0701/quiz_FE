import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { FILTER_COLOR_PALETTE } from "@/constants/filters";
import type { FilterColorKey } from "@/hooks";

// Darker color palette for badges inside combobox
const BADGE_COLOR_PALETTE: Record<string, string> = {
  primary:
    "bg-gradient-to-r from-primary/20 to-primary/30 text-primary border-primary/30 dark:from-primary/30 dark:to-primary/40 dark:text-primary-foreground shadow-sm",
  blue: "bg-gradient-to-r from-blue-500 to-indigo-500 text-blue-700 border-blue-500 dark:from-blue-500 dark:to-indigo-500 dark:text-blue-300 shadow-sm",
  green:
    "bg-gradient-to-r from-emerald-500 to-green-500 text-emerald-700 border-emerald-500 dark:from-emerald-500 dark:to-green-500 dark:text-emerald-300 shadow-sm",
  yellow:
    "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-700 border-yellow-500/30 dark:from-yellow-500/30 dark:to-amber-500/30 dark:text-yellow-300 shadow-sm",
  purple:
    "bg-gradient-to-r from-purple-500/20 to-violet-500/20 text-purple-700 border-purple-500/30 dark:from-purple-500/30 dark:to-violet-500/30 dark:text-purple-300 shadow-sm",
  default:
    "bg-gradient-to-r from-slate-200 to-slate-300 text-slate-700 border-slate-300 dark:from-slate-700 dark:to-slate-600 dark:text-slate-300 dark:border-slate-600 shadow-sm",
};

export interface MultipleSelectOption {
  value: string;
  label: string;
}

interface MultipleSelectComboboxProps {
  options: MultipleSelectOption[];
  selectedValues: string[];
  onSelect: (values: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
  filterColor?: FilterColorKey;
}

export function MultipleSelectCombobox({
  options,
  selectedValues,
  onSelect,
  placeholder = "Chọn...",
  searchPlaceholder = "Tìm kiếm...",
  emptyMessage = "Không tìm thấy.",
  className,
  disabled = false,
  filterColor,
}: MultipleSelectComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const { t } = useTranslation();

  // Get color classes based on filterColor prop
  const colorClasses = React.useMemo(() => {
    if (!filterColor) {
      return "";
    }
    return FILTER_COLOR_PALETTE[filterColor] || "";
  }, [filterColor]);

  // Get darker color classes for badge
  const badgeColorClasses = React.useMemo(() => {
    if (!filterColor) {
      return "";
    }
    return BADGE_COLOR_PALETTE[filterColor] || "";
  }, [filterColor]);

  const handleSelect = (value: string) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onSelect(newValues);
  };

  const handleRemove = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(selectedValues.filter((v) => v !== value));
  };

  const selectedLabels = React.useMemo(() => {
    return selectedValues
      .map((value) => options.find((opt) => opt.value === value)?.label)
      .filter(Boolean) as string[];
  }, [selectedValues, options]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-10 border-slate-300 dark:border-slate-600 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 focus-visible:border-transparent",
            !selectedValues.length && "text-muted-foreground",
            colorClasses,
            className
          )}
          disabled={disabled}
        >
          <div className="flex flex-1 flex-wrap gap-1 overflow-hidden">
            {selectedValues.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              selectedValues.length && (
                <Badge
                  variant="outline"
                  className={cn("mr-1", badgeColorClasses)}
                >
                  {selectedValues.length} {t("common.selected")}
                </Badge>
              )
            )}
          </div>
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
                  onSelect={() => handleSelect(option.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedValues.includes(option.value)
                        ? "opacity-100"
                        : "opacity-0"
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
  );
}
