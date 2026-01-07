// Validation Messages
export const VALIDATION_MESSAGES = {
  // Email
  EMAIL_REQUIRED: "Email is required",
  EMAIL_INVALID: "Please enter a valid email address",

  // Password
  PASSWORD_REQUIRED: "Password is required",
  PASSWORD_MIN_LENGTH: "Password must be at least 6 characters",
  CONFIRM_PASSWORD_REQUIRED: "Please confirm your password",
  PASSWORDS_DO_NOT_MATCH: "Passwords do not match",

  // Name
  NAME_REQUIRED: "Name is required",
} as const;
