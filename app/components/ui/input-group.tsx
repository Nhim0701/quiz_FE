import * as React from "react";
import { cn } from "@/lib/utils";
import { Input, type InputProps } from "./input";

export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex items-center rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
InputGroup.displayName = "InputGroup";

export interface InputGroupInputProps extends InputProps {}

const InputGroupInput = React.forwardRef<
  HTMLInputElement,
  InputGroupInputProps
>(({ className, ...props }, ref) => {
  return (
    <Input
      ref={ref}
      className={cn(
        "h-full rounded-none border-0 bg-transparent pr-8 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0",
        className
      )}
      {...props}
    />
  );
});
InputGroupInput.displayName = "InputGroupInput";

export interface InputGroupAddonProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const InputGroupAddon = React.forwardRef<HTMLDivElement, InputGroupAddonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "absolute right-3 z-10 flex items-center text-muted-foreground pointer-events-none",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
InputGroupAddon.displayName = "InputGroupAddon";

export { InputGroup, InputGroupInput, InputGroupAddon };
