import { useTranslation } from "@/i18n";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface FilterButtonConfig {
  labelKey: string;
  icon: string;
  activeClass: string;
  outlineClass: string;
}

interface FilterButtonsProps<T extends string> {
  filter: T;
  setFilter: (f: T) => void;
  filterKeys: T[];
  config: Record<T, FilterButtonConfig>;
  icons: Record<string, LucideIcon>;
}

export function FilterButtons<T extends string>({
  filter,
  setFilter,
  filterKeys,
  config,
  icons,
}: FilterButtonsProps<T>) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap gap-1.5">
      {filterKeys.map((key) => {
        const cfg = config[key];
        const Icon = icons[cfg.icon];
        const isActive = filter === key;
        return (
          <Button
            key={key}
            variant="outline"
            size="sm"
            className={cn(
              "text-xs h-7 px-2 gap-1.5 font-medium transition-all duration-200",
              isActive ? cfg.activeClass : cfg.outlineClass
            )}
            onClick={() => setFilter(key)}
          >
            {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
            {t(cfg.labelKey as any)}
          </Button>
        );
      })}
    </div>
  );
}
