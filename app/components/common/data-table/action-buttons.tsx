import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Action } from "./types";

interface ActionButtonsProps<T> {
  actions: Action<T>[];
  item: T;
}

export function ActionButtons<T>({ actions, item }: ActionButtonsProps<T>) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      {actions.map((action, index) => (
        <Button
          key={index}
          variant={action.variant || "outline"}
          size="sm"
          onClick={() => action.onClick(item)}
          className={cn(
            "h-8 px-3 text-xs font-medium transition-all",
            action.variant === "destructive" &&
              "bg-destructive text-destructive-foreground hover:bg-destructive/90"
          )}
        >
          {action.icon && <span className="mr-1.5">{action.icon}</span>}
          {action.label}
        </Button>
      ))}
    </div>
  );
}
