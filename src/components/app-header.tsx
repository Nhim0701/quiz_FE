import { Separator } from "./ui/separator";
import ThemeToggle from "./ui/theme-toggle";
import { LanguageSwitcher } from "./ui/language-switcher";
import { useSidebar } from "./ui/sidebar";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "./ui/button";
import { useTranslation } from "@/i18n";

export function AppHeader() {
  const { toggleSidebar, state } = useSidebar();
  const { t } = useTranslation();

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="h-7 w-7 -ml-1"
        aria-label={state === "collapsed" ? t("sidebar.expand") : t("sidebar.collapse")}
      >
        {state === "collapsed" ? (
          <PanelLeftOpen className="h-4 w-4" />
        ) : (
          <PanelLeftClose className="h-4 w-4" />
        )}
      </Button>
      <Separator orientation="vertical" className="mr-2 h-4" />
      <div className="ml-auto flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </header>
  );
}

