import { cn } from "@/lib";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Action } from "./types";

interface ActionButtonsProps<T> {
  actions: Action<T>[];
  item: T;
}

export function ActionButtons<T>({ actions, item }: ActionButtonsProps<T>) {
  return (
    <TooltipProvider>
      <div className="flex items-center justify-end gap-1.5">
        {actions.map((action, index) => {
          // Determine button border and icon color based on actionType
          let buttonClassName = "h-8 w-8 p-0 transition-all";

          if (
            action.variant === "destructive" ||
            action.actionType === "delete"
          ) {
            buttonClassName +=
              " border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground hover:border-destructive";
          } else if (action.actionType === "edit") {
            buttonClassName +=
              " border-green-600 text-green-600 hover:bg-green-600 hover:text-white hover:border-green-600 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-500 dark:hover:text-white dark:hover:border-green-500";
          } else if (action.actionType === "viewInfo") {
            buttonClassName +=
              " border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-500 dark:hover:text-white dark:hover:border-blue-500";
          }

          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => action.onClick(item)}
                  className={cn(buttonClassName)}
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
