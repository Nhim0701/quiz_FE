import i18n, { type InitOptions } from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en.json";
import vi from "./locales/vi.json";
import { moduleEnLocalesMerged, moduleViLocalesMerged } from "./module-locales";
import type { Resources, SupportedLanguage } from "./types";

/**
 * Normalize browser language code to supported language
 * Converts "en_US", "en-GB", "en_US.UTF-8" -> "en"
 * Converts "vi_VN", "vi-VN" -> "vi"
 * Falls back to "en" if language is not supported
 */
const normalizeLanguage = (lng: string): SupportedLanguage => {
  // Extract base language code (before underscore, hyphen, or dot)
  const parts = lng.split(/[-_.]/);
  const baseLang = parts[0]?.toLowerCase();

  if (!baseLang) {
    return "en";
  }

  // Map to supported languages
  const supportedLanguages: Record<string, SupportedLanguage> = {
    en: "en",
    vi: "vi",
  };

  // Return normalized language or fallback to "en"
  return supportedLanguages[baseLang] || "en";
};

const initOptions: InitOptions = {
  resources: {
    en: {
      translation: {
        ...en,
        ...moduleEnLocalesMerged,
      },
    },
    vi: {
      translation: {
        ...vi,
        ...moduleViLocalesMerged,
      },
    },
  } as Resources,
  fallbackLng: "en",
  debug: false,
  interpolation: {
    escapeValue: false,
  },
  detection: {
    order: ["localStorage", "navigator"],
    caches: ["localStorage"],
    convertDetectedLanguage: normalizeLanguage,
  },
  // Disable loading state when changing language
  react: {
    useSuspense: false,
  },
};

i18n.use(LanguageDetector).use(initReactI18next).init(initOptions);

export default i18n;
