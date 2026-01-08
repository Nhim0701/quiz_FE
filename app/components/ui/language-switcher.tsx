import { useTranslation } from "@/i18n";
import { Button } from "./button";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "vi" ? "en" : "vi";
    // Change language synchronously without triggering loading
    i18n.changeLanguage(newLang);
  };

  const flagSrc = i18n.language === "vi" ? "/svg/vi-flag.svg" : "/svg/en-flag.svg";

  return (
    <Button
      onClick={toggleLanguage}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
      aria-label="Toggle language"
    >
      <img
        src={flagSrc}
        alt={`${i18n.language} flag`}
        className="w-4 h-4 object-contain"
      />
      <span className="uppercase">{i18n.language}</span>
    </Button>
  );
}
