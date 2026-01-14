import { z } from "zod";
import type { TypedTFunction, TranslationKey } from "@/i18n";

/**
 * Utility functions to create Zod schemas with i18n support
 */

/**
 * Creates a required string field with trimming
 * @param t - Translation function
 * @param translationKey - Translation key for required error message
 * @param options - Optional validation options
 * @returns Zod string schema with trimming and validation
 */
export const createRequiredString = (
  t: TypedTFunction,
  translationKey: TranslationKey,
  options?: {
    minLength?: number;
    minLengthKey?: TranslationKey;
    maxLength?: number;
    maxLengthKey?: TranslationKey;
  }
) => {
  let schema = z.string().min(1, t(translationKey)).trim();

  if (options?.minLength && options.minLengthKey) {
    schema = schema.min(options.minLength, t(options.minLengthKey));
  }

  if (options?.maxLength && options.maxLengthKey) {
    schema = schema.max(options.maxLength, t(options.maxLengthKey));
  }

  return schema;
};

/**
 * Creates an optional string field with trimming and empty string transformation
 * @param t - Translation function (optional, only needed if validation is required)
 * @param options - Optional validation options
 * @returns Zod optional string schema
 */
export const createOptionalString = (
  t?: TypedTFunction,
  options?: {
    minLength?: number;
    minLengthKey?: TranslationKey;
    maxLength?: number;
    maxLengthKey?: TranslationKey;
  }
) => {
  let baseSchema = z.string();

  if (t && options?.minLength && options.minLengthKey) {
    baseSchema = baseSchema.min(options.minLength, t(options.minLengthKey));
  }

  if (t && options?.maxLength && options.maxLengthKey) {
    baseSchema = baseSchema.max(options.maxLength, t(options.maxLengthKey));
  }

  return baseSchema
    .optional()
    .transform((val) => (val === "" || val === null ? undefined : val?.trim()));
};

/**
 * Creates an email field with validation and trimming
 * @param t - Translation function
 * @param requiredKey - Translation key for required error message
 * @param invalidKey - Translation key for invalid email error message
 * @returns Zod string schema for email validation
 */
export const createEmailField = (
  t: TypedTFunction,
  requiredKey: TranslationKey,
  invalidKey: TranslationKey
) => {
  return z.string().min(1, t(requiredKey)).trim().email(t(invalidKey));
};

/**
 * Creates a password field with validation
 * Note: Password fields typically should NOT be trimmed
 * @param t - Translation function
 * @param requiredKey - Translation key for required error message
 * @param minLengthKey - Translation key for minimum length error message
 * @param minLength - Minimum password length (default: 6)
 * @param options - Optional validation options
 * @returns Zod string schema for password validation
 */
export const createPasswordField = (
  t: TypedTFunction,
  requiredKey: TranslationKey,
  minLengthKey: TranslationKey,
  minLength: number = 6,
  options?: {
    maxLength?: number;
    maxLengthKey?: TranslationKey;
  }
) => {
  let schema = z
    .string()
    .min(1, t(requiredKey))
    .min(minLength, t(minLengthKey));

  if (options?.maxLength && options.maxLengthKey) {
    schema = schema.max(options.maxLength, t(options.maxLengthKey));
  }

  return schema;
};

/**
 * Creates a boolean field with optional default
 * @param defaultValue - Default value if field is not provided (default: false)
 * @returns Zod boolean schema with default value
 */
export const createBooleanField = (defaultValue: boolean = false) => {
  return z.boolean().optional().default(defaultValue);
};

/**
 * Creates a number field with validation
 * @param t - Translation function
 * @param requiredKey - Translation key for required error message (optional)
 * @param options - Optional validation options
 * @returns Zod number schema with validation
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
  let schema = requiredKey
    ? z.number({
        required_error: t(requiredKey),
        invalid_type_error: t(requiredKey),
      })
    : z.number();

  if (options?.min && options.minKey) {
    schema = schema.min(options.min, t(options.minKey));
  }

  if (options?.max && options.maxKey) {
    schema = schema.max(options.max, t(options.maxKey));
  }

  return schema;
};

/**
 * Creates a date field (as string)
 * @param t - Translation function
 * @param requiredKey - Translation key for required error message (optional)
 * @returns Zod string schema for date validation
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
 * @template T - The inferred type from the schema
 * @param schemaFn - Function that receives translation function and returns Zod schema
 * @returns The same function for type inference
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
