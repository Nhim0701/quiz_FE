import enTranslations from "./locales/en.json";
import type { ModuleLocales } from "./module-locales";

// Deep merge helper type for nested objects
type DeepMerge<T, U> = {
  [K in keyof T | keyof U]: K extends keyof U
    ? K extends keyof T
      ? T[K] extends object
        ? U[K] extends object
          ? DeepMerge<T[K], U[K]>
          : U[K]
        : U[K]
      : U[K]
    : K extends keyof T
      ? T[K]
      : never;
};

// Merge base translations with module locales for type-safety
// Extract the translation keys type from the merged English translations
type TranslationKeys = DeepMerge<typeof enTranslations, ModuleLocales>;

// Helper type to convert nested object to dot-notation paths
type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? ObjectType[Key] extends readonly any[]
      ? `${Key}`
      : `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

// Extract all possible translation keys as dot-notation strings
export type TranslationKey = NestedKeyOf<TranslationKeys>;

// Helper type to extract the value type for a given key path
type GetNestedValue<
  T extends object,
  K extends string,
> = K extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? T[Key] extends object
      ? GetNestedValue<T[Key], Rest>
      : never
    : never
  : K extends keyof T
    ? T[K]
    : never;

// Extract all parameter names from a string template
type ExtractParams<T extends string> =
  T extends `${infer _Start}{{${infer Param}}}${infer Rest}`
    ? Param extends string
      ? Rest extends `${infer _NextStart}{{${infer _NextParam}}}${infer _NextRest}`
        ? Param | ExtractParams<Rest>
        : Param
      : never
    : never;

// Type for translation function parameters
export type TranslationParams<K extends TranslationKey> =
  GetNestedValue<TranslationKeys, K> extends string
    ? ExtractParams<GetNestedValue<TranslationKeys, K>> extends never
      ? never
      : Record<
          ExtractParams<GetNestedValue<TranslationKeys, K>>,
          string | number
        >
    : never;

// Typed translation function with optional params
// TypeScript will enforce correct params at compile time when possible
export interface TypedTFunction {
  <K extends TranslationKey>(
    key: K,
    params?: TranslationParams<K> extends never ? never : TranslationParams<K>
  ): string;
}

// Available languages
export type SupportedLanguage = "en" | "vi";

// Resources type for i18next
// Merge global locales with module locales for type-safety
export type Resources = {
  en: { translation: TranslationKeys };
  vi: { translation: TranslationKeys };
};
