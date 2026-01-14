import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BaseDropdown,
  type BaseDropdownItem,
} from "@/components/common/base-dropdown";
import { useTranslation, type TranslationKey } from "@/i18n";
import { cn } from "@/lib";
import { FILTER_COLOR_PALETTE } from "@/constants/filters";
import type { FilterColorKey } from "@/hooks";

export interface FilterOption {
  value: string;
  labelKey: string;
}

interface FilterDropdownProps {
  labelKey: string;
  options: FilterOption[];
  selectedValue?: string;
  buttonClassName: string;
  onSelect: (value: string) => void;
  filterColor?: FilterColorKey;
}

export const FilterDropdown = ({
  labelKey,
  options,
  selectedValue,
  buttonClassName,
  onSelect,
  filterColor,
}: FilterDropdownProps): React.ReactElement => {
  const { t } = useTranslation();

  const selectedOption = options.find((opt) => opt.value === selectedValue);
  const displayLabel = selectedOption
    ? t(selectedOption.labelKey as TranslationKey)
    : t(labelKey as TranslationKey);

  // Get color classes based on filterColor prop
  const colorClasses = filterColor
    ? FILTER_COLOR_PALETTE[filterColor] || ""
    : "";

  const dropdownItems: BaseDropdownItem[] = options.map((option) => ({
    key: option.value,
    label: t(option.labelKey as TranslationKey),
    onClick: () => onSelect(option.value),
    className: cn(selectedValue === option.value ? "bg-accent" : ""),
  }));

  return (
    <BaseDropdown
      trigger={
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-10 border-slate-300 dark:border-slate-600 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 focus-visible:border-transparent",
            !selectedValue && "text-muted-foreground",
            colorClasses,
            buttonClassName
          )}
        >
          {displayLabel}
          <ChevronDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      }
      items={dropdownItems}
    />
  );
};
