import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

const STICKY_CLASS =
  "lg:col-span-1 space-y-4 sm:space-y-6 lg:sticky lg:top-[88px] lg:z-40 lg:self-start";
const SHEET_BUTTON_CLASS =
  "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white";

interface SidebarShellProps {
  isMobileOrTablet: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sheetTitle: string;
  sheetAriaLabel: string;
  children: React.ReactNode;
}

export function SidebarShell({
  isMobileOrTablet,
  open,
  onOpenChange,
  sheetTitle,
  sheetAriaLabel,
  children,
}: SidebarShellProps) {
  if (isMobileOrTablet) {
    return (
      <>
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetTrigger asChild>
            <Button
              size="icon"
              className={SHEET_BUTTON_CLASS}
              aria-label={sheetAriaLabel}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-full sm:max-w-sm overflow-y-auto"
          >
            <SheetHeader>
              <SheetTitle>{sheetTitle}</SheetTitle>
            </SheetHeader>
            <div className="mt-6">{children}</div>
          </SheetContent>
        </Sheet>
        <div className="hidden lg:block" />
      </>
    );
  }

  return <div className={STICKY_CLASS}>{children}</div>;
}
