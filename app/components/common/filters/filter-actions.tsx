import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FilterAction {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  className: string;
}

interface FilterActionsProps {
  buttons: FilterAction[];
}

export const FilterActions = ({
  buttons,
}: FilterActionsProps): React.ReactElement => {
  return (
    <>
      {buttons.map((button) => {
        const Icon = button.icon;
        return (
          <Button
            key={button.id}
            variant="outline"
            size="sm"
            onClick={button.onClick}
            disabled={!button.onClick}
            className={cn("h-10", button.className)}
          >
            <Icon className="size-4" />
          </Button>
        );
      })}
    </>
  );
};
