import { useMemo, useCallback } from "react";
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

/**
 * Get button className based on action configuration
 */
const getButtonClassName = <T,>(action: Action<T>): string => {
  // Custom className takes priority
  if (action.className) {
    return cn(ACTION_BUTTON_BASE_CLASSES, action.className);
  }

  // Check for destructive variant or delete actionType
  const isDestructive =
    action.variant === "destructive" || action.actionType === "delete";

  if (isDestructive) {
    return cn(ACTION_BUTTON_BASE_CLASSES, ACTION_TYPE_CLASSES.delete);
  }

  // Use actionType to get corresponding class, fallback to default
  const typeClass =
    action.actionType && action.actionType in ACTION_TYPE_CLASSES
      ? ACTION_TYPE_CLASSES[
          action.actionType as keyof typeof ACTION_TYPE_CLASSES
        ]
      : ACTION_TYPE_CLASSES.default;

  return cn(ACTION_BUTTON_BASE_CLASSES, typeClass);
};

interface ActionButtonItemProps<T> {
  action: Action<T>;
  item: T;
  index: number;
}

function ActionButtonItem<T>({ action, item }: ActionButtonItemProps<T>) {
  const buttonClassName = useMemo(
    () => getButtonClassName<T>(action),
    [action.className, action.variant, action.actionType]
  );

  const handleClick = useCallback(() => {
    action.onClick(item);
  }, [action.onClick, item]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onClick={handleClick}
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
}

export function ActionButtons<T>({ actions, item }: ActionButtonsProps<T>) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="flex items-center justify-end gap-1.5">
        {actions.map((action, index) => (
          <ActionButtonItem
            key={`${action.label}-${index}`}
            action={action}
            item={item}
            index={index}
          />
        ))}
      </div>
    </TooltipProvider>
  );
}
