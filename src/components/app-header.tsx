import { Separator } from "./ui/separator";
import ThemeToggle from "./ui/theme-toggle";
import { LanguageSwitcher } from "./ui/language-switcher";
import { useSidebar } from "./ui/sidebar";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "./ui/button";
import { useTranslation } from "@/i18n";

export function AppHeader() {
  const { toggleSidebar, state, isMobile } = useSidebar();
  const { t } = useTranslation();

  return (
    <header 
      className="flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[padding-left] duration-200"
      style={{
        paddingLeft: !isMobile 
          ? (state === "collapsed" 
              ? "calc(var(--sidebar-width-icon) + 1rem)" 
              : "calc(var(--sidebar-width) + 1rem)")
          : undefined
      }}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className={`h-7 w-7 ${state === "collapsed" ? "ml-4" : "ml-2"}`}
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

