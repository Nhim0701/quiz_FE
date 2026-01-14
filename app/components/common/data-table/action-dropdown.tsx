import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib";
import { Button } from "@/components/ui/button";
import {
  BaseDropdown,
  type BaseDropdownItem,
} from "@/components/common/base-dropdown";
import type { Action } from "./types";

interface ActionDropdownProps<T> {
  actions: Action<T>[];
  item: T;
}

export function ActionDropdown<T>({ actions, item }: ActionDropdownProps<T>) {
  const dropdownItems: BaseDropdownItem[] = actions.map((action, index) => ({
    key: index,
    label: action.label,
    onClick: () => action.onClick(item),
    className: cn(
      action.variant === "destructive" &&
        "text-destructive focus:text-destructive"
    ),
    icon: action.icon,
  }));

  return (
    <BaseDropdown
      trigger={
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      }
      items={dropdownItems}
    />
  );
}
