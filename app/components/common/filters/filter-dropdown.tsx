import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation, type TranslationKey } from "@/i18n";
import { cn } from "@/lib";

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
}

export const FilterDropdown = ({
  labelKey,
  options,
  selectedValue,
  buttonClassName,
  onSelect,
}: FilterDropdownProps): React.ReactElement => {
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={buttonClassName}>
          {t(labelKey as TranslationKey)}
          <ChevronDownIcon className="ml-2 size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={cn(selectedValue === option.value ? "bg-accent" : "")}
          >
            {t(option.labelKey as TranslationKey)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
