import i18n from "./config";
import type { TranslationKey, TranslationParams } from "./types";

/**
 * Type-safe translation function for use outside React components
 * Usage: t("auth.login.title") or t("common.welcome", { name: "John" })
 */
export function t<K extends TranslationKey>(
  key: K,
  params?: TranslationParams<K> extends never ? never : TranslationParams<K>
): string {
  if (params) {
    return i18n.t(key, params as Record<string, string | number>);
  }
  return i18n.t(key);
}
