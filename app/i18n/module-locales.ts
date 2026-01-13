/**
 * Type-safe imports for all module locales
 * This file is used for TypeScript type inference only
 * Import all module locale files here to ensure type-safety
 */

// Import module locales directly for type-safety
import authEnLocales from "../modules/common/auth/locales/en.json";
import dashboardEnLocales from "../modules/user/dashboard/locales/en.json";
import profileEnLocales from "../modules/user/profile/locales/en.json";
import testsEnLocales from "../modules/user/tests/locales/en.json";
import adminCategoriesEnLocales from "../modules/admin/categories/locales/en.json";
import adminTestsEnLocales from "../modules/admin/tests/locales/en.json";

/**
 * Type definition for all module locales
 * Add new module imports above and merge them here
 */
export type ModuleLocales = {
  auth: typeof authEnLocales;
  dashboard: typeof dashboardEnLocales;
  profile: typeof profileEnLocales;
  tests: typeof testsEnLocales;
  admin: {
    categories: typeof adminCategoriesEnLocales;
    tests: typeof adminTestsEnLocales;
  };
};

/**
 * Auto-import all module locales from modules that have locales folder
 * Uses Vite's glob import to automatically discover and import locale files
 * Supports nested structure: modules with locales subfolder
 */

// Auto-import all en.json files from module locales folders
const moduleEnLocales = import.meta.glob<Record<string, any>>(
  "../modules/**/locales/en.json",
  { eager: true }
);

// Auto-import all vi.json files from module locales folders
const moduleViLocales = import.meta.glob<Record<string, any>>(
  "../modules/**/locales/vi.json",
  { eager: true }
);

/**
 * Convert kebab-case to camelCase
 * Example: "reward-point" -> "rewardPoint"
 */
const kebabToCamel = (str: string): string => {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
};

/**
 * Extract module name from path and convert to camelCase
 * Supports nested structure with locales folder
 * Example: "../modules/common/auth/locales/en.json" -> "auth" (takes last segment)
 */
const extractModuleName = (path: string): string => {
  const match = path.match(/modules\/(.+)\/locales/);
  if (match) {
    const fullPath = match[1];
    // Get the last segment (e.g., "common/auth" -> "auth")
    const segments = fullPath.split("/");
    const lastSegment = segments[segments.length - 1] || "";
    return kebabToCamel(lastSegment);
  }

  return "";
};

/**
 * Check if module is an admin module (categories, tests)
 */
const isAdminModule = (path: string): boolean => {
  return path.includes("/admin/");
};

/**
 * Merge all module locales into a single object
 * @param localeFiles - Object with paths as keys and locale data as values
 * @returns Merged locales object with module names as keys, or flattened for tests/admin modules
 */
const mergeModuleLocales = (
  localeFiles: Record<string, Record<string, any>>
): Record<string, Record<string, any>> => {
  const merged: Record<string, Record<string, any>> = {};

  for (const [path, localeData] of Object.entries(localeFiles)) {
    const moduleName = extractModuleName(path);
    if (moduleName) {
      // For tests module (user/tests), flatten the locales (spread contents directly)
      // because the JSON already has nested structure (test, tests, ui, result)
      if (moduleName === "tests" && !isAdminModule(path)) {
        // Spread the contents of tests locale directly into merged object
        Object.assign(merged, localeData);
      }
      // For admin modules (categories, tests), merge into admin namespace
      // because they already have "admin" structure in JSON
      else if (isAdminModule(path)) {
        // Deep merge admin namespace to combine categories and tests
        if (localeData.admin) {
          if (!merged.admin) {
            merged.admin = {};
          }
          Object.assign(merged.admin, localeData.admin);
        }
      }
      // Other modules keep their namespace structure
      else {
        merged[moduleName] = localeData;
      }
    }
  }

  return merged;
};

/**
 * Merged English locales from all modules
 * Structure: { auth: {...}, dashboard: {...}, ... }
 */
export const moduleEnLocalesMerged = mergeModuleLocales(moduleEnLocales);

/**
 * Merged Vietnamese locales from all modules
 * Structure: { auth: {...}, dashboard: {...}, ... }
 */
export const moduleViLocalesMerged = mergeModuleLocales(moduleViLocales);
