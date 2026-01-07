import { useTranslation as useI18nTranslation } from "react-i18next";
import type { TypedTFunction, SupportedLanguage } from "./types";

/**
 * Typed version of useTranslation hook
 * Provides type safety and autocomplete for translation keys
 */
export function useTranslation() {
  const { t, i18n } = useI18nTranslation();

  return {
    t: t as TypedTFunction,
    i18n: {
      ...i18n,
      language: i18n.language as SupportedLanguage,
      changeLanguage: (lng: SupportedLanguage) => i18n.changeLanguage(lng),
    },
  };
}

