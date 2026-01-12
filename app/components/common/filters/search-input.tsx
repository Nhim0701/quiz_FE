import { SearchIcon } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useTranslation, type TranslationKey } from "@/i18n";
import { KEYBOARD_KEYS } from "@/constants/filters";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholderKey: string;
  className?: string;
  searchKey?: string; // Key to use for search filter (e.g., "name", "id", "status")
}

export const SearchInput = ({
  value,
  onChange,
  onSearch,
  placeholderKey,
  className,
}: SearchInputProps): React.ReactElement => {
  const { t } = useTranslation();

  return (
    <InputGroup className={cn("flex-1 max-w-[250px]", className)}>
      <InputGroupInput
        type="text"
        placeholder={t(placeholderKey as TranslationKey)}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === KEYBOARD_KEYS.ENTER) {
            onSearch();
          }
        }}
      />
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
    </InputGroup>
  );
};
