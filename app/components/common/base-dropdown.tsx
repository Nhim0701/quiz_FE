import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

export interface BaseDropdownItem {
  key: string | number;
  label: React.ReactNode;
  onClick: () => void;
  className?: string;
  icon?: React.ReactNode;
}

interface BaseDropdownProps {
  trigger: React.ReactNode;
  items: BaseDropdownItem[];
  contentProps?: React.ComponentPropsWithoutRef<
    typeof DropdownMenuPrimitive.Content
  >;
}

export function BaseDropdown({
  trigger,
  items,
  contentProps,
}: BaseDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" {...contentProps}>
        {items.map((item) => (
          <DropdownMenuItem
            key={item.key}
            onClick={item.onClick}
            className={item.className}
          >
            {item.icon && <span className="mr-2">{item.icon}</span>}
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
