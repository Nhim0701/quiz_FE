import { z } from "zod";
import type { TypedTFunction, TranslationKey } from "@/i18n";

/**
 * Utility functions to create Zod schemas with i18n support
 */

/**
 * Creates a required string field with trimming
 */
export const createRequiredString = (
  t: TypedTFunction,
  translationKey: TranslationKey,
  options?: {
    minLength?: number;
    minLengthKey?: TranslationKey;
  }
) => {
  let schema = z.string().min(1, t(translationKey)).trim();

  if (options?.minLength && options.minLengthKey) {
    schema = schema.min(options.minLength, t(options.minLengthKey));
  }

  return schema;
};

/**
 * Creates an optional string field
 */
export const createOptionalString = () => {
  return z.string().optional();
};

/**
 * Creates an email field with validation
 */
export const createEmailField = (
  t: TypedTFunction,
  requiredKey: TranslationKey,
  invalidKey: TranslationKey
) => {
  return z.string().min(1, t(requiredKey)).email(t(invalidKey));
};

/**
 * Creates a password field with validation
 */
export const createPasswordField = (
  t: TypedTFunction,
  requiredKey: TranslationKey,
  minLengthKey: TranslationKey,
  minLength: number = 6
) => {
  return z.string().min(1, t(requiredKey)).min(minLength, t(minLengthKey));
};

/**
 * Creates a boolean field with optional default
 */
export const createBooleanField = (defaultValue: boolean = false) => {
  return z.boolean().optional().default(defaultValue);
};

/**
 * Creates a number field with validation
 */
export const createNumberField = (
  t: TypedTFunction,
  requiredKey?: TranslationKey,
  options?: {
    min?: number;
    minKey?: TranslationKey;
    max?: number;
    maxKey?: TranslationKey;
  }
) => {
  let schema = z.number();

  if (requiredKey) {
    schema = schema.min(0, t(requiredKey));
  }

  if (options?.min && options.minKey) {
    schema = schema.min(options.min, t(options.minKey));
  }

  if (options?.max && options.maxKey) {
    schema = schema.max(options.max, t(options.maxKey));
  }

  return schema;
};

/**
 * Creates a date field
 */
export const createDateField = (
  t: TypedTFunction,
  requiredKey?: TranslationKey
): z.ZodString | z.ZodOptional<z.ZodString> => {
  if (requiredKey) {
    return z.string().min(1, t(requiredKey));
  }
  return z.string().optional();
};

/**
 * Type helper for creating schema functions
 */
export type SchemaCreator<T> = (t: TypedTFunction) => z.ZodType<T>;

/**
 * Creates a Zod schema with i18n support
 * This is a helper to make schema creation more consistent
 *
 * @example
 * ```ts
 * const mySchema = createZodSchema((t) => z.object({
 *   name: createRequiredString(t, "validation.nameRequired"),
 *   email: createEmailField(t, "validation.emailRequired", "validation.emailInvalid"),
 * }));
 * ```
 */
export function createZodSchema<T>(
  schemaFn: (t: TypedTFunction) => z.ZodType<T>
): SchemaCreator<T> {
  return schemaFn;
}

/**
 * Helper to create a schema object with common validations
 * Returns an object with pre-configured validators
 */
export const createSchemaHelpers = (t: TypedTFunction) => {
  return {
    requiredString: (
      translationKey: TranslationKey,
      options?: {
        minLength?: number;
        minLengthKey?: TranslationKey;
      }
    ) => createRequiredString(t, translationKey, options),

    optionalString: () => createOptionalString(),

    email: (requiredKey: TranslationKey, invalidKey: TranslationKey) =>
      createEmailField(t, requiredKey, invalidKey),

    password: (
      requiredKey: TranslationKey,
      minLengthKey: TranslationKey,
      minLength?: number
    ) => createPasswordField(t, requiredKey, minLengthKey, minLength),

    boolean: (defaultValue?: boolean) => createBooleanField(defaultValue),

    number: (
      requiredKey?: TranslationKey,
      options?: {
        min?: number;
        minKey?: TranslationKey;
        max?: number;
        maxKey?: TranslationKey;
      }
    ) => createNumberField(t, requiredKey, options),

    date: (requiredKey?: TranslationKey) => createDateField(t, requiredKey),
  };
};
