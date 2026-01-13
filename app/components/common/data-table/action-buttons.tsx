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
          let buttonClassName =
            "h-8 w-8 p-0 transition-all duration-200 shadow-sm hover:shadow-md";

          if (
            action.variant === "destructive" ||
            action.actionType === "delete"
          ) {
            buttonClassName +=
              " border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground hover:border-destructive dark:border-destructive/50 dark:hover:border-destructive";
          } else if (action.actionType === "edit") {
            buttonClassName +=
              " border-emerald-500/50 text-emerald-600 hover:bg-gradient-to-br hover:from-emerald-500 hover:to-green-600 hover:text-white hover:border-emerald-600 dark:border-emerald-400/50 dark:text-emerald-400 dark:hover:from-emerald-600 dark:hover:to-green-700 dark:hover:border-emerald-500";
          } else if (action.actionType === "viewInfo") {
            buttonClassName +=
              " border-blue-500/50 text-blue-600 hover:bg-gradient-to-br hover:from-blue-500 hover:to-blue-600 hover:text-white hover:border-blue-600 dark:border-blue-400/50 dark:text-blue-400 dark:hover:from-blue-600 dark:hover:to-blue-700 dark:hover:border-blue-500";
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
