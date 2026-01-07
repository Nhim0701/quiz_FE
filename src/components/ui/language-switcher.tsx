import { useTranslation } from "../../i18n";
import { Button } from "./button";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "vi" ? "en" : "vi";
    // Change language synchronously without triggering loading
    i18n.changeLanguage(newLang);
  };

  return (
    <Button
      onClick={toggleLanguage}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
      aria-label="Toggle language"
    >
      <Globe className="w-4 h-4" />
      <span className="uppercase">{i18n.language}</span>
    </Button>
  );
}

