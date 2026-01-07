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
      className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4 transition-[width,margin-left] duration-200"
      style={{
        width: !isMobile
          ? state === "collapsed"
            ? "calc(100vw - var(--sidebar-width-icon) - 2.5rem)"
            : "calc(100vw - var(--sidebar-width)) - 1rem"
          : "100%",
        marginLeft: !isMobile
          ? state === "collapsed"
            ? "calc(var(--sidebar-width-icon) + 1.5rem)"
            : "calc(var(--sidebar-width))"
          : 0,
      }}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className={`h-7 w-7 ${state === "collapsed" ? "ml-4" : "ml-2"}`}
        aria-label={
          state === "collapsed" ? t("sidebar.expand") : t("sidebar.collapse")
        }
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
