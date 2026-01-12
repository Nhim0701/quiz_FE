import { Separator } from "./ui/separator";
import { LanguageSwitcher } from "./ui/language-switcher";
import ThemeToggle from "./ui/theme-toggle";
import { useSidebar } from "./ui/sidebar";
import { SquareChevronLeftIcon, SquareChevronRightIcon } from "lucide-react";

const SidebarTriggerIcon = ({
  state,
  toggleSidebar,
}: {
  state: "expanded" | "collapsed";
  toggleSidebar: () => void;
}) => {
  return state === "expanded" ? (
    <SquareChevronLeftIcon
      onClick={toggleSidebar}
      strokeWidth={1.5}
      className="text-muted-foreground"
    />
  ) : (
    <SquareChevronRightIcon
      onClick={toggleSidebar}
      strokeWidth={1.5}
      className="text-muted-foreground"
    />
  );
};

export function AppHeader() {
  const { state, toggleSidebar } = useSidebar();

  return (
    <header className="flex h-16 shrink-0 items-center gap-2">
      <div className="flex items-center gap-2 px-4 flex-1">
        <SidebarTriggerIcon state={state} toggleSidebar={toggleSidebar} />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
      </div>
      <div className="flex items-center gap-2 px-4">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>
    </header>
  );
}
