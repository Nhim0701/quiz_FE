import { cn } from "@/lib";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Action } from "./types";
import { ACTION_BUTTON_BASE_CLASSES, ACTION_TYPE_CLASSES } from "./constants";

interface ActionButtonsProps<T> {
  actions: Action<T>[];
  item: T;
}

export function ActionButtons<T>({ actions, item }: ActionButtonsProps<T>) {
  return (
    <TooltipProvider>
      <div className="flex items-center justify-end gap-1.5">
        {actions.map((action, index) => {
          // Strategy: Use custom className if provided, otherwise determine from actionType/variant
          let buttonClassName = ACTION_BUTTON_BASE_CLASSES;

          if (action.className) {
            // Custom className takes priority
            buttonClassName = cn(ACTION_BUTTON_BASE_CLASSES, action.className);
          } else {
            // Determine button border and icon color based on actionType/variant
            if (
              action.variant === "destructive" ||
              action.actionType === "delete"
            ) {
              buttonClassName = cn(
                ACTION_BUTTON_BASE_CLASSES,
                ACTION_TYPE_CLASSES.delete
              );
            } else if (action.actionType) {
              // Use actionType to get corresponding class
              buttonClassName = cn(
                ACTION_BUTTON_BASE_CLASSES,
                ACTION_TYPE_CLASSES[action.actionType] ||
                  ACTION_TYPE_CLASSES.default
              );
            } else {
              // Default fallback
              buttonClassName = cn(
                ACTION_BUTTON_BASE_CLASSES,
                ACTION_TYPE_CLASSES.default
              );
            }
          }

          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => action.onClick(item)}
                  className={buttonClassName}
                >
                  {action.icon}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{action.label}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
